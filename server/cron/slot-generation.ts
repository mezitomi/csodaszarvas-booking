import { defineCronHandler } from "#nuxt/cron";
import { runDailySlotGeneration } from "~~/lib/db/queries/slot-generation";
import env from "~~/lib/env";

export default defineCronHandler(() => env.SLOT_GENERATION_CRON, async () => {
  await runDailySlotGeneration(Number(env.SLOT_GENERATION_HORIZON_DAYS));
});
