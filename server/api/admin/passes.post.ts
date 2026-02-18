import type { PassType } from "~~/lib/db/schema/pass";

import { insertPass } from "~~/lib/db/queries/passes";
import { InsertPassSchema } from "~~/lib/db/schema/pass";

import defineAdminAuthenticatedEventHandler from "~/utils/define-admin-authenticated-event-handler";

export default defineAdminAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, InsertPassSchema.safeParse);

  if (!result.success) {
    return sendError(event, createError({
      statusCode: 422,
      statusMessage: result.error.issues.reduce((acc, issue) => `${acc};${issue.message}`, "").trim(),
    }));
  }

  const pass: Omit<PassType, "id"> = {
    ...result.data,
    createdBy: event.context.user.id,
    updatedBy: event.context.user.id,
    creditsRemaining: result.data.creditsTotal,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isDeleted: 0,
  } as Omit<PassType, "id">;

  const createdPass = await insertPass(pass);

  if (!createdPass) {
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: "Failed to create pass",
    }));
  }

  return createdPass;
});
