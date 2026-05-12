<script setup lang="ts">
import type { PassType } from "~~/lib/db/schema";

import { to } from "await-to-js";

import type { modelType } from "./step-4.vue";

type Props = {
  compatiblePasses: PassType[];
  model: modelType;
};
const props = defineProps<Props>();
const { $csrfFetch } = useNuxtApp();
const localePath = useLocalePath();
const isSubmittingOnSite = ref(false);

async function payOnSite() {
  if (!props.model.reservation || isSubmittingOnSite.value) {
    return;
  }

  isSubmittingOnSite.value = true;
  const [error, paymentResult] = await to($csrfFetch(ROUTE_CREATE_BOOKING_PAYMENT.replace("[bookingId]", props.model.reservation.id.toString()), {
    method: "POST",
    body: {
      bookingId: props.model.reservation.id,
      passId: null,
      lanesFromPass: 0,
      lanesFromDeposit: 0,
      depositAmount: 0,
      paymentStatus: PAYMENT_STATUS_ON_SITE,
    },
  }));
  isSubmittingOnSite.value = false;

  if (error) {
    console.error("Error creating on-site payment:", error);
    return;
  }

  if (paymentResult) {
    navigateTo(localePath("index"));
  }
}
</script>

<template>
  <div class="container">
    <p>{{ $t("pages.booking.steps.select_payment") }}</p>

    <UsePassModal :compatible-passes="props.compatiblePasses" :model="props.model" />
    <VaButton
      class="trigger"
      :loading="isSubmittingOnSite"
      :disabled="isSubmittingOnSite"
      @click="payOnSite"
    >
      {{ $t("pages.booking.steps.pay_on_site") }}
    </VaButton>
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

.trigger {
  inline-size: 100%;
  max-inline-size: 240px;
}
</style>
