import { getAllUsers } from "~~/lib/db/queries/users";

import defineAdminAuthenticatedEventHandler from "~/utils/define-admin-authenticated-event-handler";

export default defineAdminAuthenticatedEventHandler(async (_) => {
  return await getAllUsers();
});
