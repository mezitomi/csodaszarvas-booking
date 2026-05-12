import { and, eq, gt, inArray, lt, ne, sql } from "drizzle-orm";

import { BOOKING_STATUS_CANCELLED, MAX_LANES } from "~/utils/constants";

import db from "..";
import {
  booking,
  laneAvailability,
  SLOT_ADJUSTMENT_STATUS_ACTIVE,
  SLOT_ADJUSTMENT_STATUS_REVERTED,
  slotAdjustmentRequest,
} from "../schema";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function getStartOfDay(timestamp: number) {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function buildSlotKey(date: number, startTime: number, endTime: number) {
  return `${date}:${startTime}:${endTime}`;
}

function uniqueStartHours(startHours: number[]) {
  return Array.from(new Set(startHours)).sort((a, b) => a - b);
}

function clampLanes(lanes: number) {
  return Math.max(Math.min(lanes, MAX_LANES), 0);
}

type TxParam = Parameters<typeof db.transaction>[0] extends (tx: infer T) => any ? T : never;
type DbClient = TxParam | typeof db;

type SlotAdjustmentInput = {
  dateFrom: number;
  dateTo: number;
  requestedStartHours: number[];
  isClosed: boolean;
  requestedAvailableLanes?: number | null;
  note?: string | null;
};

export class SlotAdjustmentConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SlotAdjustmentConflictError";
  }
}

async function getBookedLanesForSlot(slotStart: number, slotEnd: number, tx: DbClient) {
  const result = await tx
    .select({
      totalBooked: sql<number>`coalesce(sum(${booking.lanesBooked}), 0)`,
    })
    .from(booking)
    .where(and(
      lt(booking.startTime, slotEnd),
      gt(booking.endTime, slotStart),
      ne(booking.status, BOOKING_STATUS_CANCELLED),
    ));

  return Number(result[0]?.totalBooked ?? 0);
}

async function hasActiveBookingOnSlot(slotStart: number, slotEnd: number, tx: DbClient) {
  const result = await tx
    .select({
      id: booking.id,
    })
    .from(booking)
    .where(and(
      lt(booking.startTime, slotEnd),
      gt(booking.endTime, slotStart),
      ne(booking.status, BOOKING_STATUS_CANCELLED),
    ))
    .limit(1);

  return result.length > 0;
}

export async function createSlotAdjustmentRequest(input: SlotAdjustmentInput, userId: number) {
  const normalizedDateFrom = getStartOfDay(input.dateFrom);
  const normalizedDateTo = getStartOfDay(input.dateTo);
  const now = Date.now();

  if (normalizedDateTo < normalizedDateFrom) {
    throw new Error("dateTo must be greater than or equal to dateFrom");
  }

  const startHours = uniqueStartHours(input.requestedStartHours);

  if (startHours.length === 0) {
    throw new Error("requestedStartHours cannot be empty");
  }

  const days: number[] = [];
  for (let date = normalizedDateFrom; date <= normalizedDateTo; date += DAY_MS) {
    days.push(date);
  }

  const targetSlots = days.flatMap(date => startHours.map((startHour) => {
    const startTime = date + startHour * HOUR_MS;
    const endTime = startTime + HOUR_MS;
    return {
      date,
      startTime,
      endTime,
    };
  }));

  return db.transaction(async (tx) => {
    const existingSlots = await tx.query.laneAvailability.findMany({
      where: (availability, operators) => operators.and(
        inArray(availability.date, days),
        inArray(availability.startTime, targetSlots.map(slot => slot.startTime)),
      ),
    });

    const existingByKey = new Map(existingSlots.map(slot => [buildSlotKey(slot.date, slot.startTime, slot.endTime), slot]));

    for (const targetSlot of targetSlots) {
      if (targetSlot.startTime <= now) {
        throw new SlotAdjustmentConflictError("Only future slots can be adjusted");
      }

      const slotKey = buildSlotKey(targetSlot.date, targetSlot.startTime, targetSlot.endTime);
      const existing = existingByKey.get(slotKey);

      if (existing?.isOverridden) {
        throw new SlotAdjustmentConflictError("One or more selected slots are already overridden");
      }

      const hasBooking = await hasActiveBookingOnSlot(targetSlot.startTime, targetSlot.endTime, tx);
      if (hasBooking) {
        throw new SlotAdjustmentConflictError("Cannot override slots that already have active bookings");
      }
    }

    const [request] = await tx.insert(slotAdjustmentRequest).values({
      dateFrom: normalizedDateFrom,
      dateTo: normalizedDateTo,
      requestedStartHours: JSON.stringify(startHours),
      isClosed: input.isClosed ? 1 : 0,
      requestedAvailableLanes: input.requestedAvailableLanes ?? null,
      note: input.note ?? null,
      status: SLOT_ADJUSTMENT_STATUS_ACTIVE,
      createdBy: userId,
      createdAt: now,
      revertedAt: null,
      revertedBy: null,
    }).returning();

    if (!request) {
      throw new Error("Failed to create slot adjustment request");
    }

    const createdOrUpdatedSlotIds: number[] = [];

    for (const targetSlot of targetSlots) {
      const key = buildSlotKey(targetSlot.date, targetSlot.startTime, targetSlot.endTime);
      const existing = existingByKey.get(key);

      let currentSlotId: number;
      let currentAvailableLanes = MAX_LANES;

      if (existing) {
        currentSlotId = existing.id;
        currentAvailableLanes = existing.availableLanes;
      }
      else {
        const [created] = await tx.insert(laneAvailability).values({
          date: targetSlot.date,
          startTime: targetSlot.startTime,
          endTime: targetSlot.endTime,
          availableLanes: MAX_LANES,
          isClosed: 0,
          isOverridden: 0,
          adjustmentRequestId: null,
          createdAt: now,
          updatedAt: now,
        }).returning();

        if (!created) {
          throw new Error("Failed to create missing lane availability slot");
        }

        currentSlotId = created.id;
        currentAvailableLanes = created.availableLanes;
      }

      const nextAvailableLanes = input.isClosed
        ? 0
        : (input.requestedAvailableLanes !== null && input.requestedAvailableLanes !== undefined
            ? clampLanes(input.requestedAvailableLanes)
            : currentAvailableLanes);

      await tx.update(laneAvailability).set({
        isClosed: input.isClosed ? 1 : 0,
        isOverridden: 1,
        adjustmentRequestId: request.id,
        availableLanes: nextAvailableLanes,
        updatedAt: now,
      }).where(eq(laneAvailability.id, currentSlotId));

      createdOrUpdatedSlotIds.push(currentSlotId);
    }

    return {
      request,
      slotCount: createdOrUpdatedSlotIds.length,
    };
  });
}

export async function revertSlotAdjustmentRequest(requestId: number, userId: number) {
  const now = Date.now();

  return db.transaction(async (tx) => {
    const request = await tx.query.slotAdjustmentRequest.findFirst({
      where: (table, operators) => operators.and(
        eq(table.id, requestId),
        eq(table.status, SLOT_ADJUSTMENT_STATUS_ACTIVE),
      ),
    });

    if (!request) {
      return null;
    }

    const slots = await tx.query.laneAvailability.findMany({
      where: (availability, operators) => operators.and(
        eq(availability.adjustmentRequestId, requestId),
        eq(availability.isOverridden, 1),
      ),
    });

    for (const slot of slots) {
      const bookedLanes = await getBookedLanesForSlot(slot.startTime, slot.endTime, tx);
      const restoredAvailableLanes = clampLanes(MAX_LANES - bookedLanes);

      await tx.update(laneAvailability).set({
        isClosed: 0,
        isOverridden: 0,
        adjustmentRequestId: null,
        availableLanes: restoredAvailableLanes,
        updatedAt: now,
      }).where(eq(laneAvailability.id, slot.id));
    }

    const [updatedRequest] = await tx.update(slotAdjustmentRequest).set({
      status: SLOT_ADJUSTMENT_STATUS_REVERTED,
      revertedAt: now,
      revertedBy: userId,
    }).where(eq(slotAdjustmentRequest.id, requestId)).returning();

    return {
      request: updatedRequest,
      restoredSlots: slots.length,
    };
  });
}

export async function getSlotAdjustmentRequests(limit = 100) {
  return db.query.slotAdjustmentRequest.findMany({
    orderBy: (request, { desc }) => [desc(request.createdAt)],
    limit,
  });
}

export async function checkSlotAdjustmentAvailability(input: Pick<SlotAdjustmentInput, "dateFrom" | "dateTo" | "requestedStartHours">) {
  const normalizedDateFrom = getStartOfDay(input.dateFrom);
  const normalizedDateTo = getStartOfDay(input.dateTo);
  const startHours = uniqueStartHours(input.requestedStartHours);

  if (normalizedDateTo < normalizedDateFrom) {
    throw new Error("dateTo must be greater than or equal to dateFrom");
  }

  if (startHours.length === 0) {
    throw new Error("requestedStartHours cannot be empty");
  }

  const days: number[] = [];
  for (let date = normalizedDateFrom; date <= normalizedDateTo; date += DAY_MS) {
    days.push(date);
  }

  const targetSlots = days.flatMap(date => startHours.map((startHour) => {
    const startTime = date + startHour * HOUR_MS;
    const endTime = startTime + HOUR_MS;
    return { date, startTime, endTime };
  }));

  const existingSlots = await db.query.laneAvailability.findMany({
    where: (availability, operators) => operators.and(
      inArray(availability.date, days),
      inArray(availability.startTime, targetSlots.map(slot => slot.startTime)),
    ),
  });

  const existingByKey = new Map(existingSlots.map(slot => [buildSlotKey(slot.date, slot.startTime, slot.endTime), slot]));
  const now = Date.now();

  let pastCount = 0;
  let overriddenCount = 0;
  let bookedCount = 0;

  for (const slot of targetSlots) {
    if (slot.startTime <= now) {
      pastCount++;
      continue;
    }

    const existing = existingByKey.get(buildSlotKey(slot.date, slot.startTime, slot.endTime));
    if (existing?.isOverridden) {
      overriddenCount++;
      continue;
    }

    const hasBooking = await hasActiveBookingOnSlot(slot.startTime, slot.endTime, db);
    if (hasBooking) {
      bookedCount++;
    }
  }

  return {
    totalSlots: targetSlots.length,
    pastCount,
    overriddenCount,
    bookedCount,
    canCreate: pastCount === 0 && overriddenCount === 0 && bookedCount === 0,
  };
}
