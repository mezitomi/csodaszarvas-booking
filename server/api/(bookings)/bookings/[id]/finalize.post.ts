import { findBooking, updateBooking } from "~~/lib/db/queries/bookings";
import { FinalizeBookingSchema } from "~~/lib/db/schema";

import { BOOKING_STATUS_RESERVED, BOOKING_STATUS_WAITING_FOR_PAYMENT } from "~/utils/constants";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, FinalizeBookingSchema.safeParse);

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

  if (existing.status !== BOOKING_STATUS_RESERVED) {
    return sendError(event, createError({ statusCode: 400, statusMessage: "Booking is not in a reservable state" }));
  }

  if (existing.reservedUntil && existing.reservedUntil < Date.now()) {
    return sendError(event, createError({ statusCode: 400, statusMessage: "Reservation has expired" }));
  }

  const updatedData = {
    ...existing,
    status: BOOKING_STATUS_WAITING_FOR_PAYMENT,
    reservedUntil: null,
    paymentDeadline: Date.now() + 15 * 60 * 1000, // 15 minutes from now
  };

  const updated = await updateBooking(updatedData, event.context.user.id);

  if (!updated) {
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: "Failed to finalize booking",
    }));
  }

  return updated;
});
