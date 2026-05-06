import { regenerateLaneAvailabilityForOpening, updateOpening } from "~~/lib/db/queries/openings";
import { to } from "await-to-js";
import { z } from "zod";

import defineAdminAuthenticatedEventHandler from "~/utils/define-admin-authenticated-event-handler";

const UpdateOpeningAvailableLanesSchema = z.object({
  availableLanes: z.number().int().min(0),
});

export default defineAdminAuthenticatedEventHandler(async (event) => {
  const id = Number.parseInt(event.context.params?.id as string, 10);

  if (!id || Number.isNaN(id)) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: "Invalid opening ID",
    }));
  }

  const result = await readValidatedBody(event, UpdateOpeningAvailableLanesSchema.safeParse);

  if (!result.success) {
    const errorMessage = result.error.issues.reduce((acc, issue) => `${acc};${issue.message}`, "").trim();
    return sendError(event, createError({
      statusCode: 422,
      statusMessage: errorMessage,
    }));
  }

  const [updateError, updated] = await to(updateOpening(id, result.data.availableLanes, event.context.user.id));

  if (updateError) {
    return sendError(event, createError({ statusCode: 500, statusMessage: "Failed to update opening" }));
  }

  if (!updated) {
    return sendError(event, createError({ statusCode: 404, statusMessage: "Opening not found" }));
  }

  // Regenerate lane availability records for this opening
  const [regenError, regeneratedCount] = await to(regenerateLaneAvailabilityForOpening(updated, event.context.user.id));

  if (regenError) {
    return sendError(event, createError({ statusCode: 500, statusMessage: "Failed to regenerate lane slots" }));
  }

  return {
    opening: updated,
    regeneratedCount,
  };
});
