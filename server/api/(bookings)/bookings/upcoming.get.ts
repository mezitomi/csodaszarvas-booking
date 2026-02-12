import { getUpcomingBookingsByUserId } from "~~/lib/db/queries/bookings";

import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  const userId = event.context.user.id;
  return await getUpcomingBookingsByUserId(userId);
});
