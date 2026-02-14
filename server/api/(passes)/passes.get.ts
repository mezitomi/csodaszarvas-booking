import { getValidUserPasses } from "~~/lib/db/queries/passes";

import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  const userId = event.context.user.id;
  return await getValidUserPasses(userId);
});
