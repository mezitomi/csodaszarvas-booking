import { insertOpening } from "~~/lib/db/queries/openings";
import { to } from "await-to-js";
import { z } from "zod";

import defineAdminAuthenticatedEventHandler from "~/utils/define-admin-authenticated-event-handler";

const CreateOpeningSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startHour: z.number().int().min(0).max(23),
  endHour: z.number().int().min(1).max(24),
  availableLanes: z.number().int().min(0),
});

export default defineAdminAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, CreateOpeningSchema.safeParse);

  if (!result.success) {
    const errorMessage = result.error.issues.reduce((acc, issue) => `${acc};${issue.message}`, "").trim();
    return sendError(event, createError({ statusCode: 422, statusMessage: errorMessage }));
  }

  const { dayOfWeek, startHour, endHour, availableLanes } = result.data;

  if (endHour <= startHour) {
    return sendError(event, createError({ statusCode: 422, statusMessage: "endHour must be greater than startHour" }));
  }

  const [error, inserted] = await to(insertOpening(dayOfWeek, startHour, endHour, availableLanes, event.context.user.id));

  if (error) {
    return sendError(event, createError({ statusCode: 500, statusMessage: "Failed to create opening" }));
  }

  return { opening: inserted };
});
