<script setup lang="ts">
import type { InsertPassType } from "~~/lib/db/schema/pass";

const emit = defineEmits<Emits>();
const { $csrfFetch } = useNuxtApp();

type Emits = {
  (e: "update:passes"): void;
};

const showModal = ref(false);

function createPass(pass: InsertPassType) {
  $csrfFetch(ROUTE_ADMIN_PASSES, {
    method: "POST",
    body: JSON.stringify(pass),
  }).then(() => {
    showModal.value = false;
    emit("update:passes");
  });
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
      <CsIssuePassForm @submit="createPass" />
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
