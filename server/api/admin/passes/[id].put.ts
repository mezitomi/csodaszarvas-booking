import { findPassById, updatePass } from "~~/lib/db/queries/passes";
import { UpdatePassSchema } from "~~/lib/db/schema/pass";

import defineAdminAuthenticatedEventHandler from "~/utils/define-admin-authenticated-event-handler";

export default defineAdminAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, UpdatePassSchema.safeParse);

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
    return sendError(event, createError({
      statusCode: 404,
      statusMessage: "Pass not found",
    }));
  }

  const updatedPass = {
    ...existing,
    creditType: result.data.creditType,
    creditsTotal: result.data.creditsTotal,
    creditsRemaining: result.data.creditsRemaining,
    expiresAt: result.data.expiresAt,
  };

  const updated = await updatePass(updatedPass, event.context.user.id);

  if (!updated) {
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: "Failed to update pass",
    }));
  }

  return updated;
});
