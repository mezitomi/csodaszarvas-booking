import { getAvailableSlots } from "~~/lib/db/queries/slots";
import { AvailableSlotsSchema } from "~~/lib/db/schema/lane-availability";

import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, AvailableSlotsSchema.safeParse);

  if (!result.success) {
    return sendError(event, createError({
      statusCode: 422,
      statusMessage: result.error.issues.reduce((acc, issue) => `${acc};${issue.message}`, "").trim(),
    }));
  }

  return await getAvailableSlots(result.data.lanes, result.data.duration);
});
