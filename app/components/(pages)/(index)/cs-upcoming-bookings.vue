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

const isMobile = useMediaQuery("(max-width: 575px)");

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

  await confirm({
    message: confirmText,
    mobileFullscreen: true,
    attachElement: "body",
    zIndex: 2000,
  })
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
    valueFormatter: params => new Date(params.data?.startTime).toLocaleString(locale.value, isMobile.value
      ? {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      : {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    flex: isMobile.value ? 3 : undefined,
  },
  {
    field: "Szolgáltatás",
    headerName: t("grids.bookings.columns.service"),
    valueGetter: params => params?.data?.equipmentNeeded ? t("pages.index.lane_and_equipment") : t("pages.index.lane"),
    hide: isMobile.value,
  },
  {
    field: "Részletek",
    headerName: t("grids.bookings.columns.details"),
    valueGetter: params => `${params.data?.lanesBooked} ${t("pages.index.lanes")} - ${params.data?.durationHours} ${t("pages.index.hours")}`,
    hide: isMobile.value,
  },
  {
    field: "status",
    headerName: t("grids.bookings.columns.status"),
    valueFormatter: params => t(`common.booking_status.${params.data?.status}`),
    flex: isMobile.value ? 3 : undefined,
  },
  {
    field: "actions",
    headerName: t("grids.bookings.columns.actions"),
    cellRenderer: CsUpcomingBookingsActionsCell,
    sortable: false,
    filter: false,
    resizable: false,
    flex: isMobile.value ? 2 : undefined,
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
    <h3 v-if="bookings && bookings.length > 0">
      {{ $t("pages.index.upcoming_bookings") }}
    </h3>
    <div v-if="bookings && bookings.length > 0" class="grid-container">
      <AgGridVue
        :key="locale"
        data-grid-name="grids.bookings"
        style="width: 100%;"
        class="ag-theme-vuestic"
        theme="legacy"
        dom-layout="autoHeight"
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
    <p v-if="!bookings || bookings.length === 0">
      {{ $t("pages.index.no_upcoming_bookings") }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.grid-container {
  inline-size: 100%;
  margin-block-start: 1rem;
}
.container {
  max-inline-size: 1000px;
  margin: 2rem auto;
  inline-size: 100%;

  h3 {
    @media (max-width: 575px) {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }
  }
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
