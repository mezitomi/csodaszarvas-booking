import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { user } from "./auth";

export const booking = sqliteTable("booking", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int().notNull().references(() => user.id),
  createdBy: int().notNull().references(() => user.id),
  createdAt: int().notNull(),
  updatedAt: int().notNull(),
  bookingDate: int().notNull(),
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
  bookingDate: true,
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
