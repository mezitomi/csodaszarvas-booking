import type { z } from "zod";

import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";

export const CRON_RUN_STATUS_RUNNING = "running";
export const CRON_RUN_STATUS_SUCCESS = "success";
export const CRON_RUN_STATUS_FAILED = "failed";

export const cronRun = sqliteTable("cron_run", {
  id: int().primaryKey({ autoIncrement: true }),
  jobName: text().notNull(),
  status: text().notNull().default(CRON_RUN_STATUS_RUNNING),
  startedAt: int().notNull(),
  finishedAt: int(),
  errorMessage: text(),
  createdAt: int().notNull(),
  updatedAt: int().notNull(),
});

export const CronRunSchema = createSelectSchema(cronRun);
export type CronRunType = z.infer<typeof CronRunSchema>;
