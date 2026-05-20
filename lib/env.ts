import { z } from "zod";

const EnvBoolean = z
  .string()
  .trim()
  .toLowerCase()
  .transform((value, ctx) => {
    if (["1", "true", "yes", "on"].includes(value))
      return true;

    if (["0", "false", "no", "off"].includes(value))
      return false;

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Expected a boolean environment value (true/false, 1/0, yes/no, on/off)",
    });
    return z.NEVER;
  });

const EnvSchema = z.object({
  NODE_ENV: z.string(),
  E2E_MODE: EnvBoolean.optional().default(false),
  TURSO_DATABASE_URL: z.string(),
  TURSO_AUTH_TOKEN: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_SECURE: EnvBoolean,
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_FROM: z.email(),
  SENTRY_AUTH_TOKEN: z.string(),
  SENTRY_DSN: z.string(),
  SLOT_GENERATION_HORIZON_DAYS: z.string(),
  SLOT_GENERATION_CRON: z.string(),
  HOME_PAGE_URL: z.string(),
});

export type EnvSchema = z.infer<typeof EnvSchema>;

// eslint-disable-next-line node/no-process-env
export default EnvSchema.parse(process.env);
