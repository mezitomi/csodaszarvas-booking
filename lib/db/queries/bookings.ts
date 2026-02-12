import { BOOKING_STATUS_ACTIVE } from "~~/app/utils/booking";
import { eq } from "drizzle-orm";

import type { BookingType } from "../schema";

import db from "..";
import { booking } from "../schema";

export async function getUpcomingBookingsByUserId(userId: number) {
  return db.query.booking.findMany({
    orderBy: (booking, { desc }) => [desc(booking.createdAt)],
    where: (booking, { and, eq, gt }) => and(
      eq(booking.userId, userId),
      gt(booking.startTime, Date.now() / 1000),
      eq(booking.status, BOOKING_STATUS_ACTIVE),
    ),
  });
}

export async function findBooking(bookingId: number, userId: number) {
  return db.query.booking.findFirst({ where: (booking, { and, eq }) => and(eq(booking.id, bookingId), eq(booking.userId, userId)) });
}

export async function updateBooking(data: BookingType, userId: number) {
  const updatedData = {
    ...data,
    updatedAt: Date.now(),
    updatedBy: Number(userId),
  };

  const [updated] = await db.update(booking).set(updatedData).where(eq(booking.id, data.id)).returning();

  return updated;
}
