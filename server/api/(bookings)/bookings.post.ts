import type { BookingType } from "~~/lib/db/schema";

import { createBooking } from "~~/lib/db/queries/bookings";
import { updateLaneAvailability } from "~~/lib/db/queries/slots";
import { InsertBookingSchema } from "~~/lib/db/schema";

import { BOOKING_STATUS_WAITING_FOR_PAYMENT } from "~/utils/constants";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, InsertBookingSchema.safeParse);

  if (!result.success) {
    return sendError(event, createError({
      statusCode: 422,
      statusMessage: result.error.issues.reduce((acc, issue) => `${acc};${issue.message}`, "").trim(),
    }));
  }

  const booking: Omit<BookingType, "id"> = {
    ...result.data,
    userId: event.context.user.id,
    createdBy: event.context.user.id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    endTime: result.data.startTime + result.data.durationHours * 3600,
    status: BOOKING_STATUS_WAITING_FOR_PAYMENT,
    participantCount: null,
    reservedUntil: Date.now() + 5 * 60 * 1000, // Hold reservation for 5 minutes
    paymentDeadline: Date.now() + 60 * 60 * 1000, // Set payment deadline to 1 hour from now
    cancelledAt: null,
  };

  const createdBooking = await createBooking(booking);

  if (!createdBooking) {
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: "Failed to create booking",
    }));
  }

  await updateLaneAvailability(createdBooking);
  return createdBooking;
});
