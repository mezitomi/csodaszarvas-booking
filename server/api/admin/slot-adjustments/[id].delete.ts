import { revertSlotAdjustmentRequest } from "~~/lib/db/queries/slot-adjustments";

import defineAdminAuthenticatedEventHandler from "~/utils/define-admin-authenticated-event-handler";

export default defineAdminAuthenticatedEventHandler(async (event) => {
  const id = Number.parseInt(event.context.params?.id as string, 10);

  if (!id || Number.isNaN(id)) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: "Invalid slot adjustment request ID",
    }));
  }

  const restored = await revertSlotAdjustmentRequest(id, event.context.user.id);

  if (!restored) {
    return sendError(event, createError({
      statusCode: 404,
      statusMessage: "Active slot adjustment request not found",
    }));
  }

  return restored;
});
