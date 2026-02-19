import { eq } from "drizzle-orm";

import { BOOKING_STATUS_CANCELLED, BOOKING_STATUS_RESERVED, BOOKING_STATUS_WAITING_FOR_PAYMENT } from "~/utils/constants";

import type { BookingType } from "../schema";

import db from "..";
import { booking } from "../schema";
import { updateLaneAvailability } from "./slots";

export async function getUpcomingBookingsByUserId(userId: number) {
  return db.query.booking.findMany({
    orderBy: (booking, { asc }) => [asc(booking.startTime)],
    where: (booking, { and, eq, gt, ne }) => and(
      eq(booking.userId, userId),
      gt(booking.startTime, Date.now()),
      ne(booking.status, BOOKING_STATUS_CANCELLED),
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

export async function cleanUpExpiredReservations() {
  const expiredReservations = await db.query.booking.findMany({
    where: (booking, { and, eq, lt, isNotNull, or }) => or(and(
      eq(booking.status, BOOKING_STATUS_RESERVED),
      isNotNull(booking.reservedUntil),
      lt(booking.reservedUntil, Date.now()),
    ), and(
      eq(booking.status, BOOKING_STATUS_WAITING_FOR_PAYMENT),
      isNotNull(booking.paymentDeadline),
      lt(booking.paymentDeadline, Date.now()),
    )),
  });

  for (const reservation of expiredReservations) {
    // Update the booking status to cancelled
    const [updated] = await db.update(booking).set({ status: BOOKING_STATUS_CANCELLED }).where(eq(booking.id, reservation.id)).returning();

    if (!updated) {
      console.error(`Failed to update booking with ID ${reservation.id} during cleanup of expired reservations.`);
      continue;
    }
    // Update lane availability by giving back the reserved lanes
    await updateLaneAvailability(updated);
  }
}

export async function createOrUpdateReservation(data: Omit<BookingType, "id">, userId: number) {
  // Check if user has an active reservation
  const reservation = await db.query.booking.findFirst({
    where: (booking, { and, eq }) => and(
      eq(booking.userId, userId),
      eq(booking.status, BOOKING_STATUS_RESERVED),
    ),
  });

  if (reservation) {
    // if no need to update lane availability (e.g., user is reserving the same slot again), we can just update the reservation with a new expiration time
    if (reservation.startTime === data.startTime && reservation.durationHours === data.durationHours && reservation.lanesBooked === data.lanesBooked) {
      const [updated] = await db
        .update(booking)
        .set({
          updatedAt: Date.now(),
          equipmentNeeded: data.equipmentNeeded,
          reservedUntil: Date.now() + 5 * 60 * 1000,
        })
        .where(eq(booking.id, reservation.id))
        .returning();

      if (!updated) {
        console.error(`Failed to update reservation with ID ${reservation.id}.`);
        return null;
      }

      return updated;
    }

    // otherwise, free up the previously reserved lanes by cancelling the existing reservation, then proceed to create a new reservation
    const [updated] = await db.update(booking).set({ status: BOOKING_STATUS_CANCELLED }).where(eq(booking.id, reservation.id)).returning();
    if (!updated) {
      console.error(`Failed to update booking with ID ${reservation.id} during cleanup of expired reservations.`);
      return null;
    }
    await updateLaneAvailability(updated);
  }

  // In a single transaction, check if the requested slot is still available and if so, create a reservation, then update lane availability.
  // This ensures that we don't end up with overbooking due to concurrent requests.
  const newReservation = await db.transaction(async (tx) => {
    const [newBooking] = await tx.insert(booking).values(data).returning();

    if (!newBooking) {
      console.error("Failed to create new reservation.");
      tx.rollback();
      return null;
    }
    const success = await updateLaneAvailability(newBooking, tx);
    if (!success) {
      console.error("Failed to update lane availability for new reservation.");
      tx.rollback();
      return null;
    }
    return newBooking;
  });

  return newReservation;
}
