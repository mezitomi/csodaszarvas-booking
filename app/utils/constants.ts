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
export const ROUTE_PRESERVE_TIME_SLOT = "/api/bookings/preserve-slot";
export const ROUTE_USER_PASSES = "/api/passes";
export const ROUTE_CREATE_BOOKING_PAYMENT = "/api/bookings/[bookingId]/payment";

export const ROUTE_ADMIN_USERS = "/api/admin/users";
export const ROUTE_ADMIN_PASSES = "/api/admin/passes";
export const ROUTE_ADMIN_PASSES_ID = "/api/admin/passes/[passId]";

export const CREDIT_TYPE_RENTAL = "regular_with_rental";
export const CREDIT_TYPE_REGULAR = "regular";

export const CreditTypes = [CREDIT_TYPE_RENTAL, CREDIT_TYPE_REGULAR] as const;
export type CreditType = (typeof CreditTypes)[number];

export const PASS_STARTING_CREDITS = 12;
export const PASS_EXPIRATION_MS = 60 * 24 * 60 * 60 * 1000; // 60 days in milliseconds

export const PAYMENT_STATUS_PAID = "paid";
export const PAYMENT_STATUS_REFUNDED = "refunded";
export const PAYMENT_STATUS_PENDING = "pending";
export const PaymentStatusTypes = [PAYMENT_STATUS_PAID, PAYMENT_STATUS_REFUNDED, PAYMENT_STATUS_PENDING] as const;
export type PaymentStatus = (typeof PaymentStatusTypes)[number];

export const USER_ROLE_USER = "user";
export const USER_ROLE_ADMIN = "admin";
export const UserRoles = [USER_ROLE_USER, USER_ROLE_ADMIN] as const;
export type UserRole = (typeof UserRoles)[number];
