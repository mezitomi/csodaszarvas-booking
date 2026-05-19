import { env as processEnv } from "node:process";
import { z } from "zod";

const E2EEnvSchema = z.object({
  E2E_BASE_URL: z.string().url().default("http://127.0.0.1:3000"),
  E2E_SKIP_WEBSERVER: z.coerce.boolean().default(false),
  CI: z.string().optional(),
});

export const e2eEnv = E2EEnvSchema.parse(processEnv);
