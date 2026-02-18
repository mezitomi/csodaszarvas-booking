<script setup lang="ts">
import type { PassType } from "~~/lib/db/schema";

import "ag-grid-community/styles/ag-grid.css";
import "@vuestic/ag-grid-theme";
import type { ColDef } from "ag-grid-community";

import { useAdminPassesStore } from "~~/stores/admin/passes";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridVue } from "ag-grid-vue3";
import { storeToRefs } from "pinia";

import CsPassActionsCell from "~/components/(pages)/(admin)/(passes)/cs-pass-actions-cell.vue";

definePageMeta({
  middleware: ["admin-logged-in"],
});

ModuleRegistry.registerModules([AllCommunityModule]);
const { locale, t } = useI18n();
const { localeText } = useAgGridLocale();

const passesStore = useAdminPassesStore();
const { passes } = storeToRefs(passesStore);
passesStore.refreshPasses();

const { $csrfFetch } = useNuxtApp();

function numberToDateFormatter(date: number | undefined) {
  if (!date) {
    return " - ";
  }
  return new Date(date).toLocaleDateString(locale.value, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const colDefs = computed<ColDef[]>(() => [
  {
    field: "id",
    headerName: t("grids.admin.passes.columns.id"),
    width: 100,
  },
  {
    field: "user.name",
    headerName: t("grids.admin.passes.columns.user"),
  },
  {
    field: "credit_type",
    headerName: t("grids.admin.passes.columns.credit_type"),
    valueFormatter: params => t(`common.credit_types.${params.data?.creditType}`),
  },
  {
    field: "creditsRemaining",
    headerName: t("grids.admin.passes.columns.credits_remaining"),
    width: 150,
  },
  {
    field: "expiresAt",
    headerName: t("grids.admin.passes.columns.expires_at"),
    valueFormatter: params => numberToDateFormatter(params.data?.expiresAt),
  },
  {
    field: "createdAt",
    headerName: t("grids.admin.passes.columns.created_at"),
    valueFormatter: params => numberToDateFormatter(params.data?.createdAt),
  },
  {
    field: "actions",
    headerName: t("grids.admin.passes.columns.actions"),
    cellRenderer: CsPassActionsCell,
    width: 120,
    sortable: false,
    filter: false,
    resizable: false,
  },
]);

const defaultColDef = ref<ColDef>({
  resizable: true,
  sortable: true,
  filter: true,
  flex: 1,
});

const gridOptions = computed(() => ({
  context: {
    onDeletePass: (passId: number) => {
      deletePass(passId);
    },
    onEditPass: (pass: PassType & { user: { name: string } }) => {
      openEditPass(pass);
    },
  },
}));

const showEditPassModal = ref(false);
const editPassModalContent = ref<PassType & { user: { name: string } } | null>(null);

function openEditPass(pass: PassType & { user: { name: string } }) {
  editPassModalContent.value = { ...pass };
  showEditPassModal.value = true;
}

function deletePass(passId: number) {
  $csrfFetch(`${ROUTE_ADMIN_PASSES}/${passId}`, {
    method: "DELETE",
    body: JSON.stringify({ id: passId }),
  }).then(() => {
    passesStore.refreshPasses();
  });
}
</script>

<template>
  <div class="container">
    <CsArrowSeparator lenght="medium" class="arrow-separator">
      <template #default>
        <h3>
          {{ $t("pages.admin.passes.title") }}
        </h3>
      </template>
    </CsArrowSeparator>
    <div style="height: 500px; width: 100%;">
      <AgGridVue
        :key="locale"
        data-grid-name="grids.admin.passes"
        style="height: 100%; width: 100%;"
        class="ag-theme-vuestic"
        theme="legacy"
        :column-defs="colDefs"
        :row-data="passes"
        :default-col-def="defaultColDef"
        :locale-text="localeText"
        :pagination="true"
        :pagination-page-size="10"
        :pagination-page-size-selector="[10, 20, 50, 100]"
        :animate-rows="true"
        :context="gridOptions.context"
      />

      <CsIssuePassModal @update:passes="passesStore.refreshPasses" />
      <CsEditPassModal
        v-model:show="showEditPassModal"
        :model-value="editPassModalContent"
        @update:passes="passesStore.refreshPasses"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-inline-size: 1200px;
  margin: auto;
}
</style>
