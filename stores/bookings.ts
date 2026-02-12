import { defineStore } from "pinia";

export type ServerResponse<T> = {
  data?: T;
  error: string | null;
};

export const useBookingsStore = defineStore("useBookingsStore", () => {
  const {
    data: bookings,
    status: bookingsStatus,
    refresh: refreshBookings,
  } = useFetch(ROUTE_UPCOMING_BOOKINGS, {
    lazy: true,
  });

  return {
    bookings,
    bookingsStatus,
    refreshBookings,
  };
});
