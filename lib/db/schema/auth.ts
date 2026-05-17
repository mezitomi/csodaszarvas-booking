import { int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { USER_ROLE_ADMIN, USER_ROLE_USER } from "../../../app/utils/constants";

export const user = sqliteTable("user", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: integer({ mode: "boolean" }).$defaultFn(() => false).notNull(),
  image: text(),
  createdAt: integer().notNull(),
  updatedAt: integer().notNull(),
  role: text(),
  banned: integer({ mode: "boolean" }),
  banReason: text(),
  banExpires: integer(),
});

export const UserSchema = createSelectSchema(user);
export type UserType = z.infer<typeof UserSchema>;

export const UpdateUserSchema = createUpdateSchema(user, {
  id: z.number(),
  role: z.enum([USER_ROLE_USER, USER_ROLE_ADMIN]),
  banned: z.boolean().optional(),
  banExpires: z.number().optional(),
  banReason: z.string().optional(),
}).omit({
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  createdAt: true,
  updatedAt: true,
});
export type UpdateUserType = z.infer<typeof UpdateUserSchema>;

export const session = sqliteTable("session", {
  id: int().primaryKey({ autoIncrement: true }),
  expiresAt: integer({ mode: "timestamp_ms" }).notNull(),
  token: text().notNull().unique(),
  createdAt: integer({ mode: "timestamp_ms" }).notNull(),
  updatedAt: integer({ mode: "timestamp_ms" }).notNull(),
  ipAddress: text(),
  userAgent: text(),
  userId: text().notNull().references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text(),
});

export const account = sqliteTable("account", {
  id: int().primaryKey({ autoIncrement: true }),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: text().notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: integer({ mode: "timestamp_ms" }),
  refreshTokenExpiresAt: integer({ mode: "timestamp_ms" }),
  scope: text(),
  password: text(),
  createdAt: integer({ mode: "timestamp_ms" }).notNull(),
  updatedAt: integer({ mode: "timestamp_ms" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: int().primaryKey({ autoIncrement: true }),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: integer({ mode: "timestamp_ms" }).notNull(),
  createdAt: integer({ mode: "timestamp_ms" }),
  updatedAt: integer({ mode: "timestamp_ms" }),
});
