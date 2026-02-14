import type { z } from "zod/v4";

import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";

import { user } from "./auth";

export const pass = sqliteTable("pass", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int().notNull().references(() => user.id, { onDelete: "cascade" }),
  passType: text().notNull(),
  creditsTotal: int().notNull(),
  creditsRemaining: int().notNull(),
  expiresAt: int().notNull(),
  createdAt: int().notNull(),
  updatedAt: int().notNull(),
});

export const PassSchema = createSelectSchema(pass);
export type PassType = z.infer<typeof PassSchema>;
