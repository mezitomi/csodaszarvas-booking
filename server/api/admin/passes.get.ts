import { getAllPassesWithUsers } from "~~/lib/db/queries/passes";

import defineAdminAuthenticatedEventHandler from "~/utils/define-admin-authenticated-event-handler";

export default defineAdminAuthenticatedEventHandler(async (_) => {
  return await getAllPassesWithUsers();
});
