<script setup lang="ts">
import type { PassTypeWithUser } from "~~/lib/db/queries/passes";
import type { UpdatePassType } from "~~/lib/db/schema/pass";

type Props = {
  modelValue: PassTypeWithUser | null;
  show: boolean;
};

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

const { $csrfFetch } = useNuxtApp();

type Emits = {
  (e: "update:passes"): void;
  (e: "update:show", value: boolean): void;
};

const showModal = computed({
  get: () => {
    return props.show;
  },
  set: (val) => {
    emit("update:show", val);
  },
});

async function cancel() {
  showModal.value = false;
}

async function editPass(pass: UpdatePassType) {
  const path = ROUTE_ADMIN_PASSES_ID.replace("[passId]", pass.id.toString());

  await $csrfFetch(path, {
    method: "PUT",
    body: JSON.stringify(pass),
  }).catch((err) => {
    console.error("Failed to update pass:", err);
  }).then(() => {
    showModal.value = false;
    emit("update:passes");
  });
}
</script>

<template>
  <VaModal
    v-model="showModal"
    :title="$t('pages.admin.passes.edit_pass')"
    closable
    hide-default-actions
    :no-outside-dismiss="false"
  >
    <template #default>
      <CsEditPassForm
        :model-value="modelValue!"
        @submit="editPass"
        @cancel="cancel"
      />
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
