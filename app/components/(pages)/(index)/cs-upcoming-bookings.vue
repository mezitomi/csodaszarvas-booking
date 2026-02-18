<script setup lang="ts">
import type { BookingType as Booking } from "~~/lib/db/schema";
import type { ColDef } from "ag-grid-community";

import "ag-grid-community/styles/ag-grid.css";
import "@vuestic/ag-grid-theme";
import { useBookingsStore } from "~~/stores/bookings";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridVue } from "ag-grid-vue3";
import { storeToRefs } from "pinia";

import CsUpcomingBookingsActionsCell from "~/components/(pages)/(index)/cs-upcoming-bookings-actions-cell.vue";

ModuleRegistry.registerModules([AllCommunityModule]);
const { locale, t } = useI18n();
const { localeText } = useAgGridLocale();

const bookingsStore = useBookingsStore();
const { bookings } = storeToRefs(bookingsStore);
bookingsStore.refreshBookings();
const { $csrfFetch } = useNuxtApp();
const { confirm } = useModal();

function canBeCancelled(booking: Booking) {
  if (booking.endTime < Date.now())
    return false;

  if (booking.status === BOOKING_STATUS_CANCELLED)
    return false;

  return true;
}

async function cancelBooking(bookingId: number) {
  const booking = bookings.value?.find(b => b.id === bookingId);
  if (!booking)
    return;

  if (!canBeCancelled(booking))
    return;

  const confirmText = booking.startTime - Date.now() < BOOKING_CANCELLATION_WINDOW_MS
    ? t("pages.index.confirm_cancel_booking_grace_period_passed_warning")
    : t("pages.index.confirm_cancel_booking");

  await confirm(confirmText)
    .then(async (confirmed) => {
      if (!confirmed)
        return;

      await $csrfFetch(ROUTE_CANCEL_BOOKING.replace("[bookingId]", bookingId.toString()), { method: "DELETE", body: JSON.stringify({ id: bookingId }) });
      bookingsStore.refreshBookings();
    });
}

const colDefs = computed<ColDef[]>(() => [
  {
    field: "startTime",
    headerName: t("grids.bookings.columns.start_time"),
    width: 100,
    valueFormatter: params => new Date(params.data?.startTime).toLocaleString(locale.value, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  },
  {
    field: "Szolgáltatás",
    headerName: t("grids.bookings.columns.service"),
    valueGetter: params => params?.data?.equipmentNeeded ? t("pages.index.lane_and_equipment") : t("pages.index.lane"),
  },
  {
    field: "Részletek",
    headerName: t("grids.bookings.columns.details"),
    valueGetter: params => `${params.data?.lanesBooked} ${t("pages.index.lanes")} - ${params.data?.durationHours} ${t("pages.index.hours")}`,
  },
  {
    field: "status",
    headerName: t("grids.bookings.columns.status"),
    valueFormatter: params => t(`common.booking_status.${params.data?.status}`),
  },
  {
    field: "actions",
    headerName: t("grids.bookings.columns.actions"),
    cellRenderer: CsUpcomingBookingsActionsCell,
    width: 120,
    sortable: false,
    filter: false,
    resizable: false,
  },
]);

const defaultColDef = ref<ColDef>({
  resizable: true,
  sortable: false,
  filter: false,
  flex: 1,
});

const gridOptions = computed(() => ({
  context: {
    onDeleteBooking: (bookingId: number) => {
      cancelBooking(bookingId);
    },
  },
}));
</script>

<template>
  <div class="container">
    <h3>
      {{ $t("pages.index.upcoming_bookings") }}
    </h3>
    <div class="grid-container">
      <AgGridVue
        :key="locale"
        data-grid-name="grids.bookings"
        style="height: 100%; width: 100%;"
        class="ag-theme-vuestic"
        theme="legacy"
        :column-defs="colDefs"
        :row-data="bookings"
        :default-col-def="defaultColDef"
        :locale-text="localeText"
        :pagination="true"
        :pagination-page-size="10"
        :pagination-page-size-selector="[10, 20, 50, 100]"
        :animate-rows="true"
        :context="gridOptions.context"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.grid-container {
  block-size: 400px;
  inline-size: 100%;
}
.container {
  max-inline-size: 1000px;
  margin: 2rem auto;
  inline-size: 100%;
}
.va-list {
  inline-size: 100%;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  min-inline-size: 0;

  .button {
    min-inline-size: 0;
    padding: 0.25rem;
  }
}
</style>
