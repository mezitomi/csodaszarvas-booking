import { BOOKING_STATUS_CANCELLED } from "~~/app/utils/booking";
import { findBooking, updateBooking } from "~~/lib/db/queries/bookings";
import { CancelBookingSchema } from "~~/lib/db/schema";

import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, CancelBookingSchema.safeParse);

  if (!result.success) {
    return sendError(event, createError({
      statusCode: 422,
      statusMessage: result.error.issues.reduce((acc, issue) => `${acc};${issue.message}`, "").trim(),
    }));
  }

  const existing = await findBooking(result.data.id, event.context.user.id);

  if (!existing) {
    return sendError(event, createError({
      statusCode: 404,
      statusMessage: "Booking not found",
    }));
  }

  if (existing.status === BOOKING_STATUS_CANCELLED) {
    return sendError(event, createError({ statusCode: 400, statusMessage: "Booking is already cancelled" }));
  }

  const updatedData = {
    ...existing,
    status: BOOKING_STATUS_CANCELLED,
  };

  const updated = await updateBooking(updatedData, event.context.user.id);
  return updated;
});
