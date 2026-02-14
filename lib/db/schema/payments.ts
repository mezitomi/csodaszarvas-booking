import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { user } from "./auth";
import { booking } from "./bookings";
import { pass } from "./pass";

export const payment = sqliteTable("payment", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int().notNull().references(() => user.id, { onDelete: "cascade" }),
  bookingId: int().notNull().references(() => booking.id, { onDelete: "cascade" }),
  passId: int().references(() => pass.id, { onDelete: "set null" }),
  lanesFromPass: int().notNull().default(0),
  lanesFromDeposit: int().notNull().default(0),
  depositAmount: int(),
  paymentStatus: text().notNull(),
  createdAt: int().notNull(),
});

export const PaymentSchema = createSelectSchema(payment);
export type PaymentType = z.infer<typeof PaymentSchema>;

export const InsertPaymentSchema = createInsertSchema(payment, {
  bookingId: z.number(),
  passId: z.number().nullable(),
  lanesFromPass: z.number().int().nonnegative(),
  lanesFromDeposit: z.number().int().nonnegative(),
  depositAmount: z.number().int().nonnegative(),
  paymentStatus: z.string(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
});
export type InsertPaymentType = z.infer<typeof InsertPaymentSchema>;
