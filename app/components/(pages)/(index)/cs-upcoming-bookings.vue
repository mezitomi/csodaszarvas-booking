<script setup lang="ts">
import type { BookingType as Booking } from "~~/lib/db/schema";

import { useBookingsStore } from "~~/stores/bookings";

const bookingsStore = useBookingsStore();
const { bookings } = storeToRefs(bookingsStore);
bookingsStore.refreshBookings();
const items = computed(() => bookings.value || []);
const { $csrfFetch } = useNuxtApp();
const { confirm } = useModal();
const { t, locale } = useI18n();

function canBeCancelled(booking: Booking) {
  // TODO: these multiplications needed just because of the db seed? once we have inserts working properly, we should be able to store timestamps in ms and get rid of these
  if (booking.endTime * 1000 < Date.now())
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

  const confirmText = booking.startTime * 1000 - Date.now() < BOOKING_CANCELLATION_WINDOW_MS
    ? t("pages.index.confirm_cancel_booking_grace_period_passed_warning")
    : t("pages.index.confirm_cancel_booking");

  await confirm(confirmText)
    .then(async (confirmed) => {
      if (!confirmed)
        return;

      await $csrfFetch(ROUTE_CANCEL_BOOKING, { method: "POST", body: JSON.stringify({ id: bookingId }) });
      bookingsStore.refreshBookings();
    });
}
</script>

<template>
  <div class="container">
    <VaList
      v-if="items.length > 0"
      fit
      spaced
    >
      <VaListLabel>
        {{ $t("pages.index.upcoming_bookings") }}
      </VaListLabel>
      <VaListItem
        v-for="booking in items"
        :key="booking.id"
        fit
      >
        <VaListItemSection>{{ new Date(booking.startTime * 1000).toLocaleString(locale) }}</VaListItemSection>
        <VaListItemSection>
          {{ booking.durationHours }} {{ $t("pages.index.hours") }}, {{ booking.lanesBooked }} {{
            $t("pages.index.lanes") }}
        </VaListItemSection>
        <VaListItemSection>
          {{ booking.equipmentNeeded ? $t('pages.index.needs_equipment')
            : $t('pages.index.brings_own_equipment') }}
        </VaListItemSection>
        <VaListItemSection class="button-group">
          <VaButton
            v-if="canBeCancelled(booking)"
            class="button"
            preset="secondary"
            hover-behavior="opacity"
            :hover-opacity="0.4"
            text-color="danger"
            @click="cancelBooking(booking.id)"
          >
            <Icon name="tabler:trash" />
          </VaButton>
        </VaListItemSection>
        <VaListSeparator spaced />
      </VaListItem>
    </VaList>
    <div v-else>
      <p>{{ $t("pages.index.no_upcoming_bookings") }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
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
