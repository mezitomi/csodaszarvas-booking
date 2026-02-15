import { findBooking, updateBooking } from "~~/lib/db/queries/bookings";
import { findPass, updatePass } from "~~/lib/db/queries/passes";
import { createPayment } from "~~/lib/db/queries/payments";
import { InsertPaymentSchema } from "~~/lib/db/schema";

import { BOOKING_STATUS_ACTIVE, CREDIT_TYPE_REGULAR, CREDIT_TYPE_RENTAL } from "~/utils/constants";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, InsertPaymentSchema.safeParse);

  if (!result.success) {
    return sendError(event, createError({
      statusCode: 422,
      statusMessage: result.error.issues.reduce((acc, issue) => `${acc};${issue.message}`, "").trim(),
    }));
  }

  const bookingToUpdate = await findBooking(result.data.bookingId, event.context.user.id);

  if (!bookingToUpdate) {
    return sendError(event, createError({
      statusCode: 404,
      statusMessage: "Booking not found",
    }));
  }

  if (result.data.passId) {
    const passToUpdate = await findPass(result.data.passId, event.context.user.id);
    if (!passToUpdate) {
      return sendError(event, createError({
        statusCode: 404,
        statusMessage: "Pass not found",
      }));
    }

    if (passToUpdate.creditsRemaining < bookingToUpdate.durationHours * bookingToUpdate.lanesBooked) {
      return sendError(event, createError({
        statusCode: 400,
        statusMessage: "Insufficient credits on pass",
      }));
    }

    if (passToUpdate.creditType !== (bookingToUpdate.equipmentNeeded ? CREDIT_TYPE_RENTAL : CREDIT_TYPE_REGULAR)) {
      return sendError(event, createError({
        statusCode: 400,
        statusMessage: "Pass credit type does not match booking equipment requirement",
      }));
    }

    const updatedPassData = {
      ...passToUpdate,
      creditsRemaining: passToUpdate.creditsRemaining - bookingToUpdate.durationHours * bookingToUpdate.lanesBooked,
      updatedAt: Date.now(),
      updatedBy: event.context.user.id,
    };

    const updatedPass = await updatePass(updatedPassData, event.context.user.id);
    if (!updatedPass) {
      return sendError(event, createError({
        statusCode: 500,
        statusMessage: "Failed to update pass with new credit balance",
      }));
    }
  }

  const paymentData = {
    ...result.data,
    userId: event.context.user.id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const created = await createPayment(paymentData);

  if (!created) {
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: "Failed to create payment",
    }));
  }

  const updatedBookingData = {
    ...bookingToUpdate,
    paymentId: created.id,
    updatedAt: created.createdAt,
    updatedBy: event.context.user.id,
    status: BOOKING_STATUS_ACTIVE,
  };

  const updatedBooking = await updateBooking(updatedBookingData, event.context.user.id);
  if (!updatedBooking) {
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: "Failed to update booking with payment information",
    }));
  }

  return created;
});
