import { createSlotAdjustmentRequest, SlotAdjustmentConflictError } from "~~/lib/db/queries/slot-adjustments";
import { to } from "await-to-js";
import { z } from "zod";

import { MAX_LANES } from "~/utils/constants";
import defineAdminAuthenticatedEventHandler from "~/utils/define-admin-authenticated-event-handler";

const CreateSlotAdjustmentSchema = z.object({
  dateFrom: z.number().int().positive(),
  dateTo: z.number().int().positive(),
  requestedStartHours: z.array(z.number().int().min(0).max(23)).min(1),
  isClosed: z.boolean(),
  requestedAvailableLanes: z.number().int().min(0).max(MAX_LANES).nullable().optional(),
  note: z.string().max(500).nullable().optional(),
});

export default defineAdminAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, CreateSlotAdjustmentSchema.safeParse);

  if (!result.success) {
    const errorMessage = result.error.issues.reduce((acc, issue) => `${acc};${issue.message}`, "").trim();
    return sendError(event, createError({ statusCode: 422, statusMessage: errorMessage }));
  }

  const [error, created] = await to(createSlotAdjustmentRequest({
    ...result.data,
    requestedAvailableLanes: result.data.isClosed ? null : result.data.requestedAvailableLanes,
  }, event.context.user.id));

  if (error) {
    if (error instanceof SlotAdjustmentConflictError) {
      return sendError(event, createError({
        statusCode: 409,
        statusMessage: error.message,
      }));
    }

    return sendError(event, createError({
      statusCode: 500,
      statusMessage: "Failed to create slot adjustment request",
    }));
  }

  return created;
});
