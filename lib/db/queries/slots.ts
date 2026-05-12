import { and, eq, gte, lt } from "drizzle-orm";

import { BOOKING_STATUS_CANCELLED, MAX_LANES } from "~/utils/constants";

import type { BookingType, LaneAvailabilityType } from "../schema";

import db from "..";
import { laneAvailability } from "../schema";

export async function getAvailableSlots(lanes: number, duration: number): Promise<string[]> {
  const availabilities: LaneAvailabilityType[] = await db.query.laneAvailability.findMany({
    where: (availability, { and, eq, gte }) => and(
      gte(availability.startTime, Date.now()), // Only consider future slots
      gte(availability.availableLanes, lanes), // Ensure enough lanes are available
      eq(availability.isClosed, 0), // Closed slots are never bookable
    ),
    orderBy: (availability, { asc }) => [asc(availability.startTime)],
  });

  if (duration === 1) {
    // No need to check for consecutive slots, just return the available ones
    return availabilities
      .map(slot => new Date(slot.startTime).toISOString());
  }

  // For durations > 1, we need to check for consecutive slots
  const filteredAvailabilities = availabilities.filter((slot, index) => {
    if (index === availabilities.length - duration) {
      return false; // Not enough slots left to check for the required duration
    }

    for (let i = 1; i < duration; i++) {
      const nextSlot = availabilities[index + i];
      if (!nextSlot) {
        return false; // No next slot to compare with
      }

      if (slot.startTime + 60 * 60 * 1000 * i !== nextSlot.startTime) {
        return false; // Slots are not consecutive
      }
    }

    return true; // Slots are consecutive and have enough lanes
  });

  return filteredAvailabilities.map(slot => new Date(slot.startTime).toISOString());
};

type TxParam = Parameters<typeof db.transaction>[0] extends (tx: infer T) => any ? T : never;

export async function updateLaneAvailability(booking: BookingType, tx?: TxParam): Promise<boolean> {
  const { startTime, durationHours, lanesBooked } = booking;

  const laneChange = booking.status === BOOKING_STATUS_CANCELLED ? lanesBooked : -lanesBooked;

  const success = await (tx ?? db).transaction(async (tx1) => {
    const slotsToUpdate = await tx1.query.laneAvailability.findMany({
      where: availability => and(
        gte(availability.startTime, startTime),
        lt(availability.startTime, startTime + durationHours * 60 * 60 * 1000),
      ),
    });

    for (const slot of slotsToUpdate) {
      const newAvailableLanes = Math.max(Math.min(slot.availableLanes + laneChange, MAX_LANES), 0); // Ensure available lanes stay within 0 and MAX_LANES
      const [updated] = await tx1.update(laneAvailability)
        .set({ availableLanes: newAvailableLanes, updatedAt: Date.now() })
        .where(eq(laneAvailability.id, slot.id))
        .returning();

      if (!updated || updated.availableLanes < 0 || updated.availableLanes > MAX_LANES) {
        console.error(`Failed to update lane availability for slot ID ${slot.id}.`);

        tx1.rollback(); // Rollback the transaction if any update fails or results in invalid lane counts
        return false;
      }
    }

    return true; // All updates succeeded
  });

  return success;
}
