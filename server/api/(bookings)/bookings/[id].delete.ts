import { BOOKING_CANCELLATION_WINDOW_MS, BOOKING_STATUS_CANCELLED, PAYMENT_STATUS_PAID } from "~~/app/utils/booking";
import { findBooking, updateBooking } from "~~/lib/db/queries/bookings";
import { findPass, updatePass } from "~~/lib/db/queries/passes";
import { findPayment } from "~~/lib/db/queries/payments";
import { updateLaneAvailability } from "~~/lib/db/queries/slots";
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

  if (!updated) {
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: "Failed to cancel booking",
    }));
  }

  if (updated.startTime - Date.now() > BOOKING_CANCELLATION_WINDOW_MS) {
    // If cancellation is made outside of the cancellation window, user should be refunded
    // If paid with pass -> update payment to refunded and add credits back to pass
    // If paid with card -> update payment to refunded and trigger refund through payment provider (not implemented yet)

    const paymentToRefund = await findPayment(updated.id, event.context.user.id);
    if (!paymentToRefund) {
      return sendError(event, createError({
        statusCode: 404,
        statusMessage: "Payment not found for booking, refund process cannot be completed",
      }));
    }

    if (paymentToRefund.passId && paymentToRefund.lanesFromPass && paymentToRefund.paymentStatus === PAYMENT_STATUS_PAID) {
      // refund to pass by adding credits back
      const passToUpdate = await findPass(paymentToRefund.passId, event.context.user.id);
      if (!passToUpdate) {
        return sendError(event, createError({
          statusCode: 404,
          statusMessage: "Pass not found for payment, refund process cannot be completed",
        }));
      }

      const updatedPassData = {
        ...passToUpdate,
        creditsRemaining: passToUpdate.creditsRemaining + updated.durationHours * updated.lanesBooked,
        updatedAt: Date.now(),
        updatedBy: event.context.user.id,
      };

      const updatedPass = await updatePass(updatedPassData, event.context.user.id);
      if (!updatedPass) {
        return sendError(event, createError({
          statusCode: 500,
          statusMessage: "Failed to update pass with refunded credits",
        }));
      }
    }

    if (paymentToRefund.lanesFromDeposit) {
      // refund to deposit by adding lanes back to availability
      // TODO: implement deposit refund logic when deposit payment method is implemented
    }
  }
  await updateLaneAvailability(updated);
  return updated;
});
