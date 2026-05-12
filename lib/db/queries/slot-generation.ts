import { eq } from "drizzle-orm";

import { MAX_LANES } from "~/utils/constants";

import db from "..";
import { cronRun, laneAvailability } from "../schema";
import { getDefaultOpenings } from "./openings";

const SLOT_GENERATION_JOB_NAME = "slot_generation_daily";
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function getStartOfDay(timestamp: number) {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function buildSlotKey(date: number, startTime: number, endTime: number) {
  return `${date}:${startTime}:${endTime}`;
}

export async function runDailySlotGeneration(horizonDays: number) {
  const now = Date.now();
  const startOfToday = getStartOfDay(now);
  const horizonEndExclusive = startOfToday + horizonDays * DAY_MS;

  const [createdCronRun] = await db.insert(cronRun).values({
    jobName: SLOT_GENERATION_JOB_NAME,
    status: "running",
    startedAt: now,
    createdAt: now,
    updatedAt: now,
  }).returning();

  if (!createdCronRun) {
    throw new Error("Failed to create cron run record");
  }

  try {
    const [openings, existingSlots] = await Promise.all([
      getDefaultOpenings(),
      db.query.laneAvailability.findMany({
        where: (availability, { and, gte, lt }) => and(
          gte(availability.date, startOfToday),
          lt(availability.date, horizonEndExclusive),
        ),
      }),
    ]);

    const existingByKey = new Map(existingSlots.map(slot => [buildSlotKey(slot.date, slot.startTime, slot.endTime), slot]));

    const toInsert: Array<typeof laneAvailability.$inferInsert> = [];
    let skippedCount = 0;

    for (let dayOffset = 0; dayOffset < horizonDays; dayOffset++) {
      const dayStart = startOfToday + dayOffset * DAY_MS;
      const dayOfWeek = new Date(dayStart).getDay();
      const dayOpenings = openings.filter(opening => opening.dayOfWeek === dayOfWeek);

      for (const dayOpening of dayOpenings) {
        const slotStart = dayStart + dayOpening.startHour * HOUR_MS;
        const slotEnd = dayStart + dayOpening.endHour * HOUR_MS;

        if (slotStart <= now) {
          skippedCount++;
          continue;
        }

        const key = buildSlotKey(dayStart, slotStart, slotEnd);

        if (existingByKey.has(key)) {
          skippedCount++;
          continue;
        }

        toInsert.push({
          date: dayStart,
          startTime: slotStart,
          endTime: slotEnd,
          availableLanes: Math.max(Math.min(dayOpening.availableLanes, MAX_LANES), 0),
          isClosed: 0,
          isOverridden: 0,
          adjustmentRequestId: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    if (toInsert.length > 0) {
      await db.insert(laneAvailability).values(toInsert);
    }

    await db.update(cronRun).set({
      status: "success",
      finishedAt: Date.now(),
      updatedAt: Date.now(),
    }).where(eq(cronRun.id, createdCronRun.id));

    return {
      generatedCount: toInsert.length,
      skippedCount,
    };
  }
  catch (error) {
    await db.update(cronRun).set({
      status: "failed",
      finishedAt: Date.now(),
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      updatedAt: Date.now(),
    }).where(eq(cronRun.id, createdCronRun.id));

    throw error;
  }
}

export async function getRecentCronRuns(limit = 30) {
  return db.query.cronRun.findMany({
    orderBy: (run, { desc }) => [desc(run.startedAt)],
    limit,
  });
}
