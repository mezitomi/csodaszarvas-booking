import { getSlotAdjustmentRequests } from "~~/lib/db/queries/slot-adjustments";

import defineAdminAuthenticatedEventHandler from "~/utils/define-admin-authenticated-event-handler";

export default defineAdminAuthenticatedEventHandler(async (_) => {
  return await getSlotAdjustmentRequests();
});
