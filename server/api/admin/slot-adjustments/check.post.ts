import { checkSlotAdjustmentAvailability } from "~~/lib/db/queries/slot-adjustments";
import { z } from "zod";

import defineAdminAuthenticatedEventHandler from "~/utils/define-admin-authenticated-event-handler";

const CheckSlotAdjustmentSchema = z.object({
  dateFrom: z.number().int().positive(),
  dateTo: z.number().int().positive(),
  requestedStartHours: z.array(z.number().int().min(0).max(23)).min(1),
});

export default defineAdminAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, CheckSlotAdjustmentSchema.safeParse);

  if (!result.success) {
    const errorMessage = result.error.issues.reduce((acc, issue) => `${acc};${issue.message}`, "").trim();
    return sendError(event, createError({ statusCode: 422, statusMessage: errorMessage }));
  }

  return await checkSlotAdjustmentAvailability(result.data);
});
