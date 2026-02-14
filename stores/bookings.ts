import { defineStore } from "pinia";

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
