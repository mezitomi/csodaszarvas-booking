import type { BookingType } from "~~/lib/db/schema";

import { cleanUpExpiredReservations, createOrUpdateReservation } from "~~/lib/db/queries/bookings";
import { PreserveSlotSchema } from "~~/lib/db/schema";

import { BOOKING_STATUS_RESERVED } from "~/utils/constants";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, PreserveSlotSchema.safeParse);

  if (!result.success) {
    return sendError(event, createError({
      statusCode: 422,
      statusMessage: result.error.issues.reduce((acc, issue) => `${acc};${issue.message}`, "").trim(),
    }));
  }

  await cleanUpExpiredReservations();

  const bookingData = {
    userId: event.context.user.id,
    createdBy: event.context.user.id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    startTime: result.data.startTime,
    endTime: result.data.startTime + result.data.durationHours * 3600 * 1000,
    durationHours: result.data.durationHours,
    lanesBooked: result.data.lanesBooked,
    equipmentNeeded: result.data.equipmentNeeded,
    status: BOOKING_STATUS_RESERVED,
    reservedUntil: Date.now() + 5 * 60 * 1000, // Hold reservation for 5 minutes
  } as Omit<BookingType, "id">;
  const reservation = await createOrUpdateReservation(bookingData, event.context.user.id);

  if (!reservation) {
    return sendError(event, createError({
      statusCode: 423,
      statusMessage: "Failed to reserve time slot",
    }));
  }

  return reservation;
});
