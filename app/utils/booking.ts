export const BOOKING_STATUS_CANCELLED = "cancelled";
export const BOOKING_STATUS_ACTIVE = "confirmed";
export const BOOKING_STATUS_WAITING_FOR_PAYMENT = "waiting_for_payment";
export const BOOKING_STATUS_RESERVED = "reserved";
export const BookingStatusTypes = [BOOKING_STATUS_CANCELLED, BOOKING_STATUS_ACTIVE, BOOKING_STATUS_WAITING_FOR_PAYMENT, BOOKING_STATUS_RESERVED] as const;

export type BookingStatus = (typeof BookingStatusTypes)[number];

export const BOOKING_CANCELLATION_WINDOW_MS = 48 * 60 * 60 * 1000;
export const MAX_LANES = 5;

export const ROUTE_UPCOMING_BOOKINGS = "/api/bookings/upcoming";
export const ROUTE_CANCEL_BOOKING = "/api/bookings/[bookingId]";
export const ROUTE_AVAILABLE_SLOTS = "/api/slots/available";
export const ROUTE_CREATE_BOOKING = "/api/bookings";
export const ROUTE_USER_PASSES = "/api/passes";
export const ROUTE_CREATE_BOOKING_PAYMENT = "/api/bookings/[bookingId]/payment";

export const PASS_TYPE_RENTAL = "regular_with_rental";
export const PASS_TYPE_REGULAR = "regular";
export const PASS_TYPE_UNLIMITED = "unlimited";

export const PassTypes = [PASS_TYPE_RENTAL, PASS_TYPE_REGULAR, PASS_TYPE_UNLIMITED] as const;
export type PassType = (typeof PassTypes)[number];

export const PASS_STARTING_CREDITS = 12;
export const PASS_EXPIRATION_MS = 60 * 24 * 60 * 60 * 1000; // 60 days in milliseconds

export const PAYMENT_STATUS_PAID = "paid";
export const PAYMENT_STATUS_REFUNDED = "refunded";
export const PAYMENT_STATUS_PENDING = "pending";
export const PaymentStatusTypes = [PAYMENT_STATUS_PAID, PAYMENT_STATUS_REFUNDED, PAYMENT_STATUS_PENDING] as const;
export type PaymentStatus = (typeof PaymentStatusTypes)[number];
