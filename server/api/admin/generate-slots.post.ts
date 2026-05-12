import { runDailySlotGeneration } from "~~/lib/db/queries/slot-generation";

import defineAdminAuthenticatedEventHandler from "~/utils/define-admin-authenticated-event-handler";

const HORIZON_DAYS = 14;

export default defineAdminAuthenticatedEventHandler(async () => {
  return await runDailySlotGeneration(HORIZON_DAYS);
});
