import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { user } from "./auth";

export const pass = sqliteTable("pass", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int().notNull().references(() => user.id, { onDelete: "cascade" }),
  creditType: text().notNull(),
  creditsTotal: int().notNull(),
  creditsRemaining: int().notNull(),
  expiresAt: int().notNull(),
  createdAt: int().notNull(),
  updatedAt: int().notNull(),
  isDeleted: int().default(0).notNull(),
});

export const passRelations = relations(pass, ({ one }) => ({
  user: one(user, {
    fields: [pass.userId],
    references: [user.id],
  }),
}));

export const PassSchema = createSelectSchema(pass);
export type PassType = z.infer<typeof PassSchema>;

export const InsertPassSchema = createInsertSchema(pass, {
  userId: z.number(),
  creditType: z.string(),
  creditsTotal: z.number().int().positive(),
  expiresAt: z.number().int().positive(),
}).omit({
  id: true,
  creditsRemaining: true,
  createdAt: true,
  updatedAt: true,
  isDeleted: true,
});
export type InsertPassType = z.infer<typeof InsertPassSchema>;

export const UpdatePassSchema = createUpdateSchema(pass, {
  id: z.number(),
  userId: z.number(),
  creditType: z.string(),
  creditsTotal: z.number().int().positive(),
  creditsRemaining: z.number().int().positive(),
  expiresAt: z.number().int().positive(),
}).omit({
  createdAt: true,
  updatedAt: true,
  isDeleted: true,
}).omit({});
export type UpdatePassType = z.infer<typeof UpdatePassSchema>;

export const DeletePassSchema = z.object({
  id: z.number(),
});
export type DeletePassType = z.infer<typeof DeletePassSchema>;
