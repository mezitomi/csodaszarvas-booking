import { getRecentCronRuns } from "~~/lib/db/queries/slot-generation";

import defineAdminAuthenticatedEventHandler from "~/utils/define-admin-authenticated-event-handler";

export default defineAdminAuthenticatedEventHandler(async (_) => {
  return await getRecentCronRuns();
});
