<script setup lang="ts">
import type { PassType as SchemaPassType } from "~~/lib/db/schema";
import type { Ref } from "vue";

import { useAvailableSlotsStore } from "~~/stores/available-slots";
import { usePassesStore } from "~~/stores/passes";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { defineVaStepperSteps, useForm as vuesticUseForm } from "vuestic-ui";

definePageMeta({
  middleware: ["logged-in"],
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
  creditType: undefined as undefined | CreditType,
  selectedSlot: undefined as undefined | string,
});

const computedCreditType = computed({
  get() {
    return model.value.creditType;
  },
  set(newValue: { text: string; value: string }) {
    model.value.creditType = newValue.value as CreditType;
  },
});

const reservationId = ref<number | null>(null);
const availableSlotsStore = useAvailableSlotsStore();
const { availableSlots } = storeToRefs(availableSlotsStore);

const passesStore = usePassesStore();
const { passes } = storeToRefs(passesStore);
const compatiblePasses: Ref<SchemaPassType[]> = computed(() => {
  return (passes.value ?? []).filter((pass) => {
    return pass.creditsRemaining >= model.value.duration! * model.value.lanes!
      && pass.expiresAt > Date.parse(model.value.selectedSlot!);
  });
});

const { confirm } = useModal();
const { $csrfFetch } = useNuxtApp();
const localePath = useLocalePath();

const stepForm = ref();
vuesticUseForm(stepForm);

const selectedDate = ref<Date | null>(null);

const slots = computed(() => {
  if (!selectedDate.value)
    return [];

  return availableSlots.value.filter((slot: string) => new Date(slot).toDateString() === selectedDate.value?.toDateString());
});

whenever(currentStep, async (newStep) => {
  if (newStep === 2) {
    await availableSlotsStore.refreshAvailableSlots(model.value.lanes!, model.value.duration!);
  }

  if (newStep === 5) {
    await passesStore.refreshPasses();
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
    label: t("pages.booking.step_3_date_selection_title"),
  },
  {
    label: t("pages.booking.step_4_equipment_selection_title"),
    beforeLeave: async (step) => {
      step.hasError = computedCreditType.value === undefined;
      return !step.hasError;
    },
  },
  {
    label: t("pages.booking.step_5_confirmation_title"),
  },
  {
    label: t("pages.booking.step_6_payment_title"),
  },
]));

const selectPaymentModal = ref(false);

async function payWithPass(pass: SchemaPassType) {
  const paymentResult = await $csrfFetch(ROUTE_CREATE_BOOKING_PAYMENT.replace("[bookingId]", reservationId.value!.toString()), {
    method: "POST",
    body: {
      bookingId: reservationId.value!,
      passId: pass.id,
      lanesFromPass: model.value.lanes!,
      lanesFromDeposit: 0,
      depositAmount: 0,
      paymentStatus: PAYMENT_STATUS_PAID,
    },
  })
    .catch((error) => {
      // Handle errors, e.g., show an error message
      console.error("Error applying pass to booking:", error);
    });

  if (paymentResult) {
    navigateTo(localePath("index"));
  }
}

async function reserveBooking() {
  const reserved = await $csrfFetch(ROUTE_CREATE_BOOKING, {
    method: "POST",
    body: {
      startTime: Date.parse(model.value.selectedSlot!),
      durationHours: model.value.duration,
      lanesBooked: model.value.lanes,
      equipmentNeeded: Number(computedCreditType.value === CREDIT_TYPE_RENTAL),
    },
  })
    .catch((error) => {
      // Handle errors, e.g., show an error message
      console.error("Error confirming booking:", error);
    });

  if (reserved) {
    reservationId.value = reserved.id;
    currentStep.value += 1;
  }
}

async function payWithCard() {
  // Implement logic to handle card payment
  confirm({
    title: "Card payment",
    message: "Card payment is not implemented yet. For now, it will just confirm the booking without actual payment processing.",
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
          <VaRadio v-model="model.lanes" :options="[1, 2, 3, 4, 5]" />
        </template>
        <template #step-content-1>
          <p>{{ $t("pages.booking.step_2_duration_description") }}</p>
          <VaRadio v-model="model.duration" :options="[1, 2, 3]" />
        </template>
        <template #step-content-2>
          <p>{{ $t("pages.booking.step_3_date_selection_description") }}</p>
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
        <template #step-content-3>
          <p>{{ $t("pages.booking.step_4_equipment_selection_description") }}</p>
          <VaRadio
            v-model="computedCreditType"
            :options="[
              {
                text: t('pages.booking.equipment_option_use_own'),
                value: CREDIT_TYPE_REGULAR,
              },
              {
                text: t('pages.booking.equipment_option_rent'),
                value:
                  CREDIT_TYPE_RENTAL,
              },
            ]"
          />
        </template>
        <template #step-content-4>
          <p>{{ $t("pages.booking.step_5_confirmation_description") }}</p>
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
            <p v-if="computedCreditType">
              {{ $t("pages.booking.equipment") }}: {{ computedCreditType === CREDIT_TYPE_REGULAR ? t('pages.booking.equipment_option_use_own') : t('pages.booking.equipment_option_rent') }}
            </p>
            <VaButton @click="reserveBooking">
              {{ $t("pages.booking.proceed_to_payment") }}
            </VaButton>
          </div>
        </template>
        <template #step-content-5>
          <p>{{ $t("pages.booking.step_6_payment_description") }}</p>
          <VaButton :disabled="compatiblePasses.length === 0" @click="selectPaymentModal = true">
            {{ $t("pages.booking.pay_with_pass") }}
          </VaButton>
          <VaButton @click="payWithCard">
            {{ $t("pages.booking.pay_with_card") }}
          </VaButton>
          <VaModal v-model="selectPaymentModal">
            <VaCard v-for="pass in compatiblePasses" :key="pass.id">
              <VaCardTitle> {{ pass.creditType }}</VaCardTitle>
              <VaCardContent>
                <p>
                  {{ $t('pages.booking.expires_at') }}: {{ new Date(pass.expiresAt).toLocaleDateString() }}
                </p>
                <p>
                  {{ pass.creditsRemaining }} {{ $t('pages.booking.credits_remaining') }}
                </p>
                <VaButton v-if="pass.creditType === computedCreditType" @click="payWithPass(pass)">
                  {{ $t('pages.booking.use_pass') }}
                </VaButton>
                <VaPopover v-else :message="$t('pages.booking.incompatible_pass')">
                  <VaButton disabled>
                    {{ $t("pages.booking.use_pass") }}
                  </VaButton>
                </VaPopover>
              </VaCardContent>
            </VaCard>
          </VaModal>
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
      <p v-if="computedCreditType">
        Felszerelés: {{ computedCreditType === CREDIT_TYPE_REGULAR ? t('pages.booking.equipment_option_use_own') : t('pages.booking.equipment_option_rent') }}
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
