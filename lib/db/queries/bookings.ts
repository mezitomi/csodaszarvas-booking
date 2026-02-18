import { eq } from "drizzle-orm";

import { BOOKING_STATUS_ACTIVE, BOOKING_STATUS_WAITING_FOR_PAYMENT } from "~/utils/constants";

import type { BookingType } from "../schema";

import db from "..";
import { booking } from "../schema";

export async function getUpcomingBookingsByUserId(userId: number) {
  return db.query.booking.findMany({
    orderBy: (booking, { asc }) => [asc(booking.startTime)],
    where: (booking, { and, eq, gt, inArray }) => and(
      eq(booking.userId, userId),
      gt(booking.startTime, Date.now()),
      inArray(booking.status, [BOOKING_STATUS_ACTIVE, BOOKING_STATUS_WAITING_FOR_PAYMENT]),
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

export async function createBooking(data: Omit<BookingType, "id">) {
  const [created] = await db.insert(booking).values(data).returning();
  return created;
}
