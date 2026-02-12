export const BOOKING_STATUS_CANCELLED = "cancelled";
export const BOOKING_STATUS_ACTIVE = "confirmed";
export const BOOKING_STATUS_WAITING_FOR_PAYMENT = "waiting_for_payment";
export const BOOKING_STATUS_RESERVED = "reserved";
export const BookingStatusTypes = [BOOKING_STATUS_CANCELLED, BOOKING_STATUS_ACTIVE, BOOKING_STATUS_WAITING_FOR_PAYMENT, BOOKING_STATUS_RESERVED] as const;

export type BookingStatus = (typeof BookingStatusTypes)[number];

export const BOOKING_CANCELLATION_WINDOW_MS = 48 * 60 * 60 * 1000;

export const ROUTE_UPCOMING_BOOKINGS = "/api/bookings/upcoming";
export const ROUTE_CANCEL_BOOKING = "/api/bookings/cancel";
