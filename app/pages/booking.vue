<script setup lang="ts">
import type { PassType } from "~~/lib/db/schema";
import type { Ref } from "vue";

import { useAvailableSlotsStore } from "~~/stores/available-slots";
import { usePassesStore } from "~~/stores/passes";
import { to } from "await-to-js";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { defineVaStepperSteps, useForm as vuesticUseForm } from "vuestic-ui";

import type { modelType } from "~/components/(pages)/(booking)/step-4.vue";

import { ROUTE_PRESERVE_TIME_SLOT } from "~/utils/constants";

definePageMeta({
  middleware: ["logged-in"],
});
const { t } = useI18n();
const title = t("brand_name");
useHead({
  title,
  titleTemplate: null,
});

const model = reactive<modelType>({
  currentStep: 0,
  lanes: 1,
  duration: 1,
  creditType: CREDIT_TYPE_RENTAL,
  selectedSlot: null,
  reservation: null,
});

const availableSlotsStore = useAvailableSlotsStore();
const { availableSlots } = storeToRefs(availableSlotsStore);

const passesStore = usePassesStore();
const { passes } = storeToRefs(passesStore);
const compatiblePasses: Ref<PassType[]> = computed(() => {
  return (passes.value ?? []).filter((pass) => {
    return pass.creditsRemaining >= model.duration! * model.lanes!
      && pass.expiresAt > Date.parse(model.selectedSlot!);
  });
});

const { $csrfFetch } = useNuxtApp();

const stepForm = ref();
vuesticUseForm(stepForm);

whenever(() => model.currentStep, async (newStep) => {
  if (newStep === 1) {
    await availableSlotsStore.refreshAvailableSlots(model.lanes, model.duration);
  }

  if (newStep === 4) {
    await passesStore.refreshPasses();
  }
});

async function preserveTimeSlot() {
  if (!model.selectedSlot)
    return false;

  const [error, result] = await to($csrfFetch(ROUTE_PRESERVE_TIME_SLOT, {
    method: "POST",
    body: {
      startTime: Date.parse(model.selectedSlot),
      durationHours: model.duration,
      lanesBooked: model.lanes,
      equipmentNeeded: model.creditType === CREDIT_TYPE_RENTAL ? 1 : 0,
    },
  }));

  if (error) {
    console.error("Error preserving time slot:", error);
    return false;
  }

  model.reservation = result;

  return result;
}

async function finalizeBookingDetails() {
  if (!model.reservation)
    return false;

  const [error] = await to($csrfFetch(`${ROUTE_CREATE_BOOKING}/${model.reservation.id}/finalize`, {
    method: "POST",
    body: JSON.stringify({
      id: model.reservation.id,
    }),
  }));

  if (error) {
    console.error("Error finalizing booking:", error);
    return false;
  }

  return true;
}

const steps = ref(defineVaStepperSteps([
  {
    label: t("pages.booking.steps.step_1_label"),
  },
  {
    label: t("pages.booking.steps.step_2_label"),
    beforeLeave: async (step) => {
      await preserveTimeSlot()
        .then((success) => {
          step.hasError = !success;
        });
    },
  },
  {
    label: t("pages.booking.steps.step_3_label"),
    beforeLeave: async (step) => {
      await preserveTimeSlot()
        .then((success) => {
          step.hasError = !success;
        });
    },
  },
  {
    label: t("pages.booking.steps.step_4_label"),
    beforeLeave: async (step) => {
      await finalizeBookingDetails()
        .then((success) => {
          if (!success) {
            step.hasError = !success;
          }
        });
    },
  },
  {
    label: t("pages.booking.steps.step_5_label"),
  },
]));
</script>

<template>
  <div class="container">
    <CsArrowSeparator lenght="medium" class="arrow-separator">
      <template #default>
        <h1>{{ $t("brand_name") }}</h1>
      </template>
    </CsArrowSeparator>
    <VaForm ref="stepForm">
      <VaStepper
        v-model="model.currentStep"
        :steps="steps"
        linear
        vertical
        finish-button-hidden
        next-disabled-on-error
        navigation-disabled
      >
        <template #controls="{ nextStep, prevStep }">
          <div class="btn-container">
            <VaButton
              v-if="model.currentStep !== 4"
              class="btn"
              :disabled="model.currentStep === 0 || model.currentStep === 4"
              @click="prevStep()"
            >
              {{ $t("pages.booking.steps.back") }}
            </VaButton>
            <VaButton
              v-if="model.currentStep !== 4"
              class="btn"
              @click="nextStep()"
            >
              {{ $t("pages.booking.steps.next") }}
            </VaButton>
          </div>
        </template>

        <template #step-content-0>
          <Step1
            v-model:lanes="model.lanes"
            v-model:duration="model.duration"
          />
        </template>
        <template #step-content-1>
          <Step2
            v-model:selected-slot="model.selectedSlot"
            :available-slots="availableSlots"
          />
        </template>
        <template #step-content-2>
          <Step3 :credit-type="model.creditType" @update:credit-type="model.creditType = $event" />
        </template>
        <template #step-content-3>
          <Step4 :model="model" />
        </template>
        <template #step-content-4>
          <Step5
            :compatible-passes="compatiblePasses"
            :model="model"
          />
        </template>
      </VaStepper>
    </VaForm>
  </div>
</template>

<style lang="scss" scoped>
.container {
  max-inline-size: 1000px;
  margin-inline: auto;

  :deep(.va-stepper__step-button__icon) {
    display: none;
  }
}

:deep(.va-stepper__navigation--vertical) {
  @media (max-width: 575px) {
    margin-inline: 1rem;
    padding-inline-start: 0;
  }
}

:deep(.va-radio__square) {
  margin-inline-end: 1rem;
}

.btn-container {
  display: flex;
  gap: 1.5rem;
  inline-size: 100%;
}

.btn {
  inline-size: 100%;
}
</style>
