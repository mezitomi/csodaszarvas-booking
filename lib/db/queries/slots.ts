import { and, eq, gte, lt } from "drizzle-orm";

import { BOOKING_STATUS_CANCELLED, MAX_LANES } from "~/utils/constants";

import type { BookingType, LaneAvailabilityType } from "../schema";

import db from "..";
import { laneAvailability } from "../schema";

export async function getAvailableSlots(lanes: number, duration: number): Promise<string[]> {
  const availabilities: LaneAvailabilityType[] = await db.query.laneAvailability.findMany({
    where: (availability, { and, gte }) => and(
      gte(availability.startTime, Date.now()), // Only consider future slots
      gte(availability.availableLanes, lanes), // Ensure enough lanes are available
    ),
    orderBy: (availability, { asc }) => [asc(availability.startTime)],
  });

  if (duration === 1) {
    // No need to check for consecutive slots, just return the available ones
    return availabilities
      .map(slot => new Date(slot.startTime).toISOString());
  }

  // For durations > 1, we need to check for consecutive slots
  const filteredAvailabilities = availabilities.filter((slot, index) => {
    if (index === availabilities.length - duration) {
      return false; // Not enough slots left to check for the required duration
    }

    for (let i = 1; i < duration; i++) {
      const nextSlot = availabilities[index + i];
      if (!nextSlot) {
        return false; // No next slot to compare with
      }

      if (slot.startTime + 60 * 60 * 1000 * i !== nextSlot.startTime) {
        return false; // Slots are not consecutive
      }
    }

    return true; // Slots are consecutive and have enough lanes
  });

  return filteredAvailabilities.map(slot => new Date(slot.startTime).toISOString());
};

export async function updateLaneAvailability(booking: BookingType) {
  const { startTime, durationHours, lanesBooked } = booking;

  const laneChange = booking.status === BOOKING_STATUS_CANCELLED ? lanesBooked : -lanesBooked;

  const slotsToUpdate = await db.query.laneAvailability.findMany({
    where: availability => and(
      gte(availability.startTime, startTime),
      lt(availability.startTime, startTime + durationHours * 60 * 60 * 1000),
    ),
  });

  slotsToUpdate.forEach(async (slot) => {
    const newAvailableLanes = Math.max(Math.min(slot.availableLanes + laneChange, MAX_LANES), 0); // Ensure available lanes stay within 0 and MAX_LANES
    await db.update(laneAvailability)
      .set({ availableLanes: newAvailableLanes, updatedAt: Date.now() })
      .where(eq(laneAvailability.id, slot.id));
  });
}
