<script setup lang="ts">
type Props = {
  lanes: number;
  duration: number;
};
type Emits = {
  (event: "update:lanes", value: number): void;
  (event: "update:duration", value: number): void;
};

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const lanes = computed({
  get: () => props.lanes,
  set: (value: number) => emit("update:lanes", value),
});
const duration = computed({
  get: () => props.duration,
  set: (value: number) => emit("update:duration", value),
});
</script>

<template>
  <div class="container">
    <p>{{ $t("pages.booking.steps.select_lanes") }}</p>
    <div class="select-wrapper">
      <VaSelect
        v-model="lanes"
        :options="[1, 2, 3, 4, 5]"
      />
    </div>
    <p>{{ $t("pages.booking.steps.select_duration") }}</p>
    <div class="select-wrapper">
      <VaSelect
        v-model="duration"
        :options="[1, 2, 3]"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-inline-size: none;
  .select-wrapper {
    max-inline-size: 200px;
  }
}
</style>
