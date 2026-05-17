<script setup lang="ts">
import type { PassType } from "~~/lib/db/schema/pass";
import type { ICellRendererParams } from "ag-grid-community";

const props = defineProps<{
  params: ICellRendererParams<PassType>;
}>();

const { t } = useI18n();
const { confirm } = useModal();

function handleEdit() {
  props.params.context?.onEditPass(props.params.data);
}

async function handleDelete() {
  if (!props.params.data?.id || !props.params.context?.onDeletePass) {
    return;
  }

  await confirm({
    message: t("pages.admin.passes.delete_pass_confirm_message"),
    mobileFullscreen: true,
    attachElement: "body",
    zIndex: 2000,
  })
    .then(async (confirmed) => {
      if (!confirmed)
        return;

      props.params.context.onDeletePass(props.params.data?.id);
    });
}
</script>

<template>
  <div class="actions-cell">
    <VaButton
      color="primary"
      preset="secondary"
      @click="handleEdit"
    >
      <Icon name="tabler:pencil" />
    </VaButton>
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
