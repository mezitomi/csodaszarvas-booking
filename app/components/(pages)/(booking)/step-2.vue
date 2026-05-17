<script setup lang="ts">
type Props = {
  availableSlots: string[];
  selectedSlot: string | null;
};

type Emits = {
  (event: "update:selectedSlot", value: string | null): void;
};

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { locale } = useI18n();
const { weekdayNames, firstWeekday, monthNames } = useDatePickerLocale();
const datePickerKey = computed(() => `${locale.value}-${firstWeekday.value}`);

const selectedDate = ref<Date | null>(null);

const slots = computed(() => {
  if (!selectedDate.value)
    return [];

  return props.availableSlots.filter((slot: string) => new Date(slot).toDateString() === selectedDate.value?.toDateString());
});

const selectedSlot = computed({
  get: () => props.selectedSlot,
  set: (value: string | null) => emit("update:selectedSlot", value),
});

whenever(() => selectedSlot.value && !selectedDate.value, () => {
  emit("update:selectedSlot", null);
});
</script>

<template>
  <div class="container">
    <p>{{ $t("pages.booking.steps.select_date") }}</p>
    <div class="content">
      <VaDatePicker
        :key="datePickerKey"
        v-model="selectedDate"
        :allowed-days="day => availableSlots.some((slot: string) => new Date(slot).toDateString() === day.toDateString())"
        :first-weekday="firstWeekday"
        :weekday-names="weekdayNames"
        :month-names="monthNames"
        stateful
        @update:model-value="selectedSlot = null"
      />
      <div class="chips">
        <VaChip
          v-for="slot in slots"
          :key="slot"
          :outline="selectedSlot !== slot"
          @click="selectedSlot = selectedSlot === slot ? null : slot"
        >
          {{ new Date(slot).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) }}
        </VaChip>
      </div>
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

  .va-chip {
    width: fit-content;
    height: fit-content;
  }

  .content {
    display: flex;
    justify-content: center;
  }

  .chips {
    display: flex;
    gap: 0.5rem;
    margin-left: 2rem;
    flex-wrap: wrap;
    min-inline-size: 40px;

    @media (min-width: 575px) {
      flex-direction: column;
    }
  }
}

@media (max-width: 575px) {
  .container {
    .content {
      flex-direction: column;
      align-items: center;
    }

    .chips {
      margin-left: 0;
      margin-top: 1rem;
      justify-content: center;
    }
  }
}
</style>
