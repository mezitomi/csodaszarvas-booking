import { eq } from "drizzle-orm";

import type { OpeningType } from "../schema";

import db from "..";
import { opening } from "../schema";

export async function getDefaultOpenings() {
  return db.query.opening.findMany({
    orderBy: (opening, { asc }) => [asc(opening.dayOfWeek), asc(opening.startHour)],
  });
}

export async function updateOpening(id: number, availableLanes: number, userId: number) {
  const updatedData = {
    availableLanes,
    updatedAt: Date.now(),
    updatedBy: userId,
  };

  const [updated] = await db.update(opening).set(updatedData).where(eq(opening.id, id)).returning();
  return updated;
}

export async function insertOpening(dayOfWeek: number, startHour: number, endHour: number, availableLanes: number, userId: number) {
  const now = Date.now();
  const [inserted] = await db.insert(opening).values({
    dayOfWeek,
    startHour,
    endHour,
    availableLanes,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId,
  }).returning();
  return inserted;
}

export async function regenerateLaneAvailabilityForOpening(_openingRecord: OpeningType, _userId: number): Promise<number> {
  // TODO: Implement lane availability regeneration logic
  // This function should:
  // 1. Update existing lane_availability records for this dayOfWeek + startHour/endHour for next 60 days
  // 2. Create new lane_availability records with updated availableLanes count
  // 3. Return count of regenerated records

  return 0; // Placeholder count
}
