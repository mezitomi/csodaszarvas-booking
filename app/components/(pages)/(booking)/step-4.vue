<script setup lang="ts">
import type { BookingType } from "~~/lib/db/schema";

export type modelType = {
  currentStep: number;
  lanes: number;
  duration: number;
  creditType: CreditType | null;
  selectedSlot: string | null;
  reservation: BookingType | null;
};

type Props = {
  model: modelType;
};

defineProps<Props>();

const { locale } = useI18n();
</script>

<template>
  <div class="container">
    <p>{{ $t("pages.booking.steps.confirmation") }}</p>
    <div>
      <p>{{ $t("pages.booking.booking_details") }}:</p>
      <p v-if="model.selectedSlot">
        {{ $t("pages.booking.selected_slot") }}: {{ new Date(model.selectedSlot).toLocaleString(locale) }}
      </p>
      <p v-if="model.duration">
        {{ $t("pages.booking.duration") }}: {{ model.duration }} {{ $t("pages.booking.hours") }}
      </p>
      <p v-if="model.lanes">
        {{ $t("pages.booking.lanes") }}: {{ model.lanes }}
      </p>
      <p v-if="model.creditType">
        {{ $t("pages.booking.equipment") }}: {{ model.creditType === CREDIT_TYPE_REGULAR ? $t('pages.booking.steps.equipment_option_use_own') : $t('pages.booking.steps.equipment_option_rent') }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-inline-size: 800px;
  margin: auto;
}
</style>
