<script setup lang="ts">
import type { PassType } from "~~/lib/db/schema";

import type { modelType } from "./step-4.vue";

type Props = {
  compatiblePasses: PassType[];
  model: modelType;
};

const props = defineProps<Props>();

const { $csrfFetch } = useNuxtApp();
const localePath = useLocalePath();

async function payWithPass(pass: PassType) {
  const paymentResult = await $csrfFetch(ROUTE_CREATE_BOOKING_PAYMENT.replace("[bookingId]", props.model.reservation!.id.toString()), {
    method: "POST",
    body: {
      bookingId: props.model.reservation!.id,
      passId: pass.id,
      lanesFromPass: props.model.lanes!,
      lanesFromDeposit: 0,
      depositAmount: 0,
      paymentStatus: PAYMENT_STATUS_PAID,
    },
  })
    .catch((error) => {
      console.error("Error applying pass to booking:", error);
    });

  if (paymentResult) {
    navigateTo(localePath("index"));
  }
}

const showModal = ref(false);
</script>

<template>
  <VaModal v-model="showModal" hide-default-actions>
    <template #anchor="{ show }">
      <VaButton
        :disabled="compatiblePasses.length === 0"
        class="trigger"
        @click="show()"
      >
        {{ $t("pages.booking.steps.pay_with_pass") }}
      </VaButton>
    </template>

    <template #default>
      <div class="cards">
        <VaCard v-for="pass in compatiblePasses" :key="pass.id">
          <VaCardTitle> {{ pass.creditType }}</VaCardTitle>
          <VaCardContent>
            <p>
              {{ $t('pages.booking.expires_at') }}: {{ new Date(pass.expiresAt).toLocaleDateString() }}
            </p>
            <p>
              {{ pass.creditsRemaining }} {{ $t('pages.booking.credits_remaining') }}
            </p>
            <VaButton v-if="pass.creditType === model.creditType" @click="payWithPass(pass)">
              {{ $t('pages.booking.steps.use_pass') }}
            </VaButton>
            <VaPopover v-else :message="$t('pages.booking.steps.incompatible_pass')">
              <VaButton disabled>
                {{ $t("pages.booking.steps.use_pass") }}
              </VaButton>
            </VaPopover>
          </VaCardContent>
        </VaCard>
      </div>
    </template>
  </VaModal>
</template>

<style scoped lang="scss">
.cards {
  display: flex;
  gap: 20px;
  flex-direction: row;
  flex-wrap: wrap;
}

.va-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
  }
  inline-size: 300px;
}

.trigger {
  inline-size: 100%;
  max-inline-size: 200px;
}
</style>
