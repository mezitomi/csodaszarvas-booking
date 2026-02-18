import { findPassById, updatePass } from "~~/lib/db/queries/passes";
import { DeletePassSchema } from "~~/lib/db/schema/pass";

import defineAdminAuthenticatedEventHandler from "~/utils/define-admin-authenticated-event-handler";

export default defineAdminAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, DeletePassSchema.safeParse);

  if (!result.success) {
    return sendError(event, createError({
      statusCode: 422,
      statusMessage: result.error.issues.reduce((acc, issue) => `${acc};${issue.message}`, "").trim(),
    }));
  }

  const existing = await findPassById(result.data.id);

  if (!existing) {
    return sendError(event, createError({
      statusCode: 404,
      statusMessage: "Pass not found",
    }));
  }

  if (existing.isDeleted) {
    return; // how to handle this? pass is already deleted, but we can return 404 or just ignore the request
  }

  const updatedPass = {
    ...existing,
    isDeleted: 1,
  };

  const deleted = await updatePass(updatedPass, event.context.user.id);

  if (!deleted) {
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: "Failed to delete pass",
    }));
  }
});
