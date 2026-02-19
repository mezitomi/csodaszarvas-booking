<script setup lang="ts">
type Props = {
  creditType: CreditType | null;
};

type Emits = {
  (event: "update:credit-type", value: CreditType | null): void;
};

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const computedCreditType = computed({
  get: () => props.creditType,
  set: (setValue: { text: string; value: CreditType }) => {
    if (setValue.value) {
      emit("update:credit-type", setValue.value);
    }
  },
});
</script>

<template>
  <div class="container">
    <p>{{ $t("pages.booking.steps.select_equipment") }}</p>
    <VaRadio
      v-model="computedCreditType"
      :options="[
        {
          text: $t('pages.booking.steps.equipment_option_use_own'),
          value: CREDIT_TYPE_REGULAR,
        },
        {
          text: $t('pages.booking.steps.equipment_option_rent'),
          value:
            CREDIT_TYPE_RENTAL,
        },
      ]"
    />
  </div>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-inline-size: 800px;
}
</style>
