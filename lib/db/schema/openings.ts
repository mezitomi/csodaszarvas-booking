import { int, sqliteTable, unique } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const opening = sqliteTable("opening", {
  id: int().primaryKey({ autoIncrement: true }),
  dayOfWeek: int().notNull(),
  startHour: int().notNull(), // 0-23, Add this to the date to get the actual timestamp for the slot
  endHour: int().notNull(),
  availableLanes: int().notNull(),
  createdAt: int().notNull(),
  updatedAt: int().notNull(),
  updatedBy: int().notNull(),
  createdBy: int().notNull(),
}, table => [
  unique().on(table.dayOfWeek, table.startHour, table.endHour),
]);

export const OpeningSchema = createSelectSchema(opening);
export type OpeningType = z.infer<typeof OpeningSchema>;

export const InsertOpeningSchema = createInsertSchema(opening, {
  dayOfWeek: z.number(),
  startHour: z.number(),
  endHour: z.number(),
  availableLanes: z.number(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  updatedBy: true,
  createdBy: true,
});
export type InsertOpeningType = z.infer<typeof InsertOpeningSchema>;

export const UpdateOpeningSchema = createUpdateSchema(opening, {
  id: z.number(),
  dayOfWeek: z.number(),
  startHour: z.number(),
  endHour: z.number(),
  availableLanes: z.number(),
}).omit({
  createdAt: true,
  updatedAt: true,
  updatedBy: true,
  createdBy: true,
});
export type UpdateOpeningType = z.infer<typeof UpdateOpeningSchema>;
