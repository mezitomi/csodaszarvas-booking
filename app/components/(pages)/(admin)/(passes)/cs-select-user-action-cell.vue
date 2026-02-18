<script setup lang="ts">
import type { UserType } from "~~/lib/db/schema/auth";
import type { ICellRendererParams } from "ag-grid-community";

const props = defineProps<{
  params: ICellRendererParams<UserType>;
}>();

function selectUser() {
  if (!props.params.data || !props.params.context?.onUserSelected) {
    return;
  }

  props.params.context.onUserSelected(props.params.data);
}
</script>

<template>
  <div class="actions-cell">
    <VaButton @click="selectUser">
      {{ $t("pages.admin.passes.select_user") }}
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
