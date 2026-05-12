import type { z } from "zod";

import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";

export const SLOT_ADJUSTMENT_STATUS_ACTIVE = "active";
export const SLOT_ADJUSTMENT_STATUS_REVERTED = "reverted";

export const slotAdjustmentRequest = sqliteTable("slot_adjustment_request", {
  id: int().primaryKey({ autoIncrement: true }),
  dateFrom: int().notNull(),
  dateTo: int().notNull(),
  requestedStartHours: text().notNull(),
  isClosed: int().notNull().default(0),
  requestedAvailableLanes: int(),
  note: text(),
  status: text().notNull().default(SLOT_ADJUSTMENT_STATUS_ACTIVE),
  createdBy: int().notNull(),
  createdAt: int().notNull(),
  revertedBy: int(),
  revertedAt: int(),
});

export const SlotAdjustmentRequestSchema = createSelectSchema(slotAdjustmentRequest);
export type SlotAdjustmentRequestType = z.infer<typeof SlotAdjustmentRequestSchema>;
