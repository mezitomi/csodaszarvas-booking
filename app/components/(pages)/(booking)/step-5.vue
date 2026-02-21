<script setup lang="ts">
import type { PassType } from "~~/lib/db/schema";

import type { modelType } from "./step-4.vue";

type Props = {
  compatiblePasses: PassType[];
  model: modelType;
};
const props = defineProps<Props>();
const { confirm } = useModal();

async function payWithCard() {
  confirm({
    title: "Card payment",
    message: "Card payment is not implemented yet. ",
  });
}
</script>

<template>
  <div class="container">
    <p>{{ $t("pages.booking.steps.select_payment") }}</p>

    <UsePassModal :compatible-passes="props.compatiblePasses" :model="props.model" />
    <VaButton class="trigger" @click="payWithCard">
      {{ $t("pages.booking.steps.pay_with_card") }}
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
  max-inline-size: 200px;
}
</style>
