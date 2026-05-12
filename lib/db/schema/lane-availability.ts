import { int, sqliteTable, unique } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { slotAdjustmentRequest } from "./slot-adjustment-request";

export const laneAvailability = sqliteTable(
  "lane_availability",
  {
    id: int().primaryKey({ autoIncrement: true }),
    date: int().notNull(),
    startTime: int().notNull(),
    endTime: int().notNull(),
    availableLanes: int().notNull().default(5),
    isClosed: int().notNull().default(0),
    isOverridden: int().notNull().default(0),
    adjustmentRequestId: int().references(() => slotAdjustmentRequest.id, { onDelete: "set null" }),
    createdAt: int().notNull(),
    updatedAt: int().notNull(),
  },
  table => [
    // Prevent duplicate slots for same date+time
    unique().on(table.date, table.startTime, table.endTime),
  ],
);

export const LaneAvailabilitySchema = createSelectSchema(laneAvailability);
export type LaneAvailabilityType = z.infer<typeof LaneAvailabilitySchema>;

export const AvailableSlotsSchema = z.object({
  lanes: z.number().int().positive(),
  duration: z.number().int().positive(),
});
export type AvailableSlotsType = z.infer<typeof AvailableSlotsSchema>;
