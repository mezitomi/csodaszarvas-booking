<script setup lang="ts">
import type { InsertPassType } from "~~/lib/db/schema/pass";

import { to } from "await-to-js";

const emit = defineEmits<Emits>();
const { $csrfFetch } = useNuxtApp();

type Emits = {
  (e: "update:passes"): void;
};

const showModal = ref(false);
const isSubmitting = ref(false);

async function createPass(pass: InsertPassType) {
  if (isSubmitting.value)
    return;

  isSubmitting.value = true;
  const [error] = await to($csrfFetch(ROUTE_ADMIN_PASSES, {
    method: "POST",
    body: JSON.stringify(pass),
  }));
  isSubmitting.value = false;

  if (error) {
    console.error("Failed to issue pass:", error);
    return;
  }

  showModal.value = false;
  emit("update:passes");
}
</script>

<template>
  <VaModal
    v-model="showModal"
    :title="$t('pages.admin.passes.issue_pass')"
    closable
    hide-default-actions
  >
    <template #anchor="{ show }">
      <VaButton preset="secondary" @click="show()">
        {{ $t("pages.admin.passes.issue_pass") }}
      </VaButton>
    </template>

    <template #default>
      <CsIssuePassForm :loading="isSubmitting" @submit="createPass" />
    </template>
  </VaModal>
</template>

<style scoped lang="scss">
.pass-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
