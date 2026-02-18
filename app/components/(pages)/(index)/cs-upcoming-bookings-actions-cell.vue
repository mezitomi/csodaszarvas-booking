<script setup lang="ts">
import type { BookingType as Booking } from "~~/lib/db/schema";
import type { ICellRendererParams } from "ag-grid-community";

const props = defineProps<{
  params: ICellRendererParams<Booking>;
}>();

async function handleDelete() {
  if (!props.params.data?.id || !props.params.context?.onDeleteBooking) {
    return;
  }

  props.params.context.onDeleteBooking(props.params.data?.id);
}
</script>

<template>
  <div class="actions-cell">
    <VaButton
      color="danger"
      preset="secondary"
      @click="handleDelete"
    >
      <Icon name="tabler:trash" />
    </VaButton>
  </div>
</template>

<style scoped>
.actions-cell {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  height: 100%;
}
</style>
