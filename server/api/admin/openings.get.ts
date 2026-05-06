import { getDefaultOpenings } from "~~/lib/db/queries/openings";

import defineAdminAuthenticatedEventHandler from "~/utils/define-admin-authenticated-event-handler";

export default defineAdminAuthenticatedEventHandler(async (_) => {
  return await getDefaultOpenings();
});
