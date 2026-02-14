<script setup lang="ts">
import { useAvailableSlotsStore } from "~~/stores/available-slots";
import { ref } from "vue";
import { defineVaStepperSteps, useForm as vuesticUseForm } from "vuestic-ui";

definePageMeta({
  middleware: ["route"],
});
const { t, locale } = useI18n();
const title = t("brand_name");
useHead({
  title,
  titleTemplate: null,
});
const currentStep = ref(0);
const model = ref({
  lanes: undefined as undefined | number,
  duration: undefined as undefined | number,
  equipmentOption: undefined as undefined | string,
  selectedSlot: undefined as undefined | string,
});
const availableSlotsStore = useAvailableSlotsStore();
const { availableSlots } = storeToRefs(availableSlotsStore);
const { confirm } = useModal();
const { $csrfFetch } = useNuxtApp();
const localePath = useLocalePath();

vuesticUseForm("stepForm");

const selectedDate = ref<Date | null>(null);

const slots = computed(() => {
  if (!selectedDate.value)
    return [];

  return availableSlots.value.filter((slot: string) => new Date(slot).toDateString() === selectedDate.value?.toDateString());
});

whenever(currentStep, async (newStep) => {
  if (newStep === 3) {
    await availableSlotsStore.refreshAvailableSlots(model.value.lanes!, model.value.duration!);
  }
});

const steps = ref(defineVaStepperSteps([
  {
    label: t("pages.booking.step_1_lane_selection_title"),
    beforeLeave: (step) => {
      step.hasError = model.value.lanes === undefined;
      return !step.hasError;
    },
  },
  {
    label: t("pages.booking.step_2_duration_title"),
    beforeLeave: (step) => {
      step.hasError = model.value.duration === undefined;
      return !step.hasError;
    },
  },
  {
    label: t("pages.booking.step_3_equipment_selection_title"),
    beforeLeave: async (step) => {
      step.hasError = model.value.equipmentOption === undefined;
      return !step.hasError;
    },
  },
  {
    label: t("pages.booking.step_4_date_selection_title"),
  },
  {
    label: t("pages.booking.step_5_confirmation_title"),
  },
]));

async function confirmBooking() {
  await confirm("Are you sure you want to confirm this booking?")
    .then(async (confirmed) => {
      if (!confirmed)
        return;

      $csrfFetch(ROUTE_CREATE_BOOKING, {
        method: "POST",
        body: {
          startTime: Date.parse(model.value.selectedSlot!),
          durationHours: model.value.duration,
          lanesBooked: model.value.lanes,
          equipmentNeeded: model.value.equipmentOption === "Bérlek felszerelést" ? 1 : 0,
        },
      })
        .then(() => {
          // Handle successful booking, e.g., show a success message or redirect
          navigateTo(localePath("index"));
        })
        .catch((error) => {
          // Handle errors, e.g., show an error message
          console.error("Error confirming booking:", error);
        });
    });
}
</script>

<template>
  <div class="container">
    <CsArrowSeparator lenght="medium" class="arrow-separator">
      <template #default>
        <h1>{{ $t("brand_name") }}</h1>
      </template>
    </CsArrowSeparator>
    <!-- eslint-disable-next-line vue/no-unused-refs -->
    <VaForm ref="stepForm">
      <VaStepper
        v-model="currentStep"
        :steps="steps"
        linear
        vertical
        finish-button-hidden
      >
        <template #step-content-0>
          <p>{{ $t("pages.booking.step_1_lane_selection_description") }}</p>
          <VaRadio
            v-model="model.lanes"
            :options="[1, 2, 3, 4, 5]"
          />
        </template>
        <template #step-content-1>
          <p>{{ $t("pages.booking.step_2_duration_description") }}</p>
          <VaRadio
            v-model="model.duration"
            :options="[1, 2, 3]"
          />
        </template>
        <template #step-content-2>
          <p>{{ $t("pages.booking.step_3_equipment_selection_description") }}</p>
          <VaRadio
            v-model="model.equipmentOption"
            :options="['Van felszerelésem', 'Bérlek felszerelést']"
          />
        </template>
        <template #step-content-3>
          <p>{{ $t("pages.booking.step_4_date_selection_description") }}</p>
          <VaDatePicker
            v-model="selectedDate"
            :allowed-days="day => availableSlots.some((slot: string) => new Date(slot).toDateString() === day.toDateString())"
            stateful
            @update:model-value="model.selectedSlot = undefined"
          />
          <VaChip
            v-for="slot in slots"
            :key="slot"
            :outline="model.selectedSlot !== slot"
            @click="model.selectedSlot = model.selectedSlot === slot ? undefined : slot"
          >
            {{ new Date(slot).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) }}
          </VaChip>
        </template>
        <template #step-content-4>
          <p>{{ $t("pages.booking.step_5_confirmation_title") }}</p>
          <div>
            Foglalási adatok:
            <p v-if="model.lanes">
              Pályák száma: {{ model.lanes }}
            </p>
            <p v-if="model.duration">
              Időtartam: {{ model.duration }} óra
            </p>
            <p v-if="model.equipmentOption">
              Felszerelés: {{ model.equipmentOption }}
            </p>
            <p v-if="model.selectedSlot">
              Kiválasztott időpont: {{ new Date(model.selectedSlot).toLocaleString(locale) }}
            </p>
            <VaButton
              @click="confirmBooking"
            >
              {{ $t("pages.booking.step_5_cta_text") }}
            </VaButton>
          </div>
        </template>
      </VaStepper>
    </VaForm>
    <div>
      Foglalási adatok:
      <p v-if="model.lanes">
        Pályák száma: {{ model.lanes }}
      </p>
      <p v-if="model.duration">
        Időtartam: {{ model.duration }} óra
      </p>
      <p v-if="model.equipmentOption">
        Felszerelés: {{ model.equipmentOption }}
      </p>
      <p v-if="model.selectedSlot">
        Kiválasztott időpont: {{ new Date(model.selectedSlot).toLocaleString(locale) }}
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  max-inline-size: 1000px;
  margin-inline: auto;
}
:deep(.va-radio__square) {
  margin-inline-end: 1rem;
}
</style>
