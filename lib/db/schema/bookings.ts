import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { user } from "./auth";

export const booking = sqliteTable("booking", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int().notNull().references(() => user.id),
  createdBy: int().notNull().references(() => user.id),
  createdAt: int().notNull(),
  updatedAt: int().notNull(),
  startTime: int().notNull(),
  endTime: int().notNull(),
  durationHours: int().notNull(),
  lanesBooked: int().notNull(),
  equipmentNeeded: int().notNull(),
  participantCount: int(),
  status: text().notNull(),
  reservedUntil: int(),
  paymentDeadline: int(),
  cancelledAt: int(),
});

export const BookingSchema = createSelectSchema(booking);
export type BookingType = z.infer<typeof BookingSchema>;

export const CancelBookingSchema = createUpdateSchema(booking, {
  id: z.number(),
}).omit({
  userId: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  startTime: true,
  endTime: true,
  durationHours: true,
  lanesBooked: true,
  equipmentNeeded: true,
  participantCount: true,
  status: true,
  reservedUntil: true,
  paymentDeadline: true,
  cancelledAt: true,
});
export type CancelBookingType = z.infer<typeof CancelBookingSchema>;

export const InsertBookingSchema = createInsertSchema(booking, {
  startTime: z.number().gt(Date.now()),
}).omit({
  id: true,
  userId: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  endTime: true,
  participantCount: true,
  status: true,
  reservedUntil: true,
  paymentDeadline: true,
  cancelledAt: true,
});
export type InsertBookingType = z.infer<typeof InsertBookingSchema>;

export const PreserveSlotSchema = createInsertSchema(booking, {
  startTime: z.number().gt(Date.now()),
  equipmentNeeded: z.number().default(0),
}).omit({
  id: true,
  userId: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  endTime: true,
  participantCount: true,
  status: true,
  reservedUntil: true,
  paymentDeadline: true,
  cancelledAt: true,
});
export type PreserveSlotType = z.infer<typeof PreserveSlotSchema>;

export const FinalizeBookingSchema = createUpdateSchema(booking, {
  id: z.number(),
}).omit({
  userId: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  startTime: true,
  endTime: true,
  durationHours: true,
  lanesBooked: true,
  equipmentNeeded: true,
  participantCount: true,
  status: true,
  reservedUntil: true,
  paymentDeadline: true,
  cancelledAt: true,
});
export type FinalizeBookingType = z.infer<typeof FinalizeBookingSchema>;
