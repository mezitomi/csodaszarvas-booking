<script setup lang="ts">
import type { ColDef } from "ag-grid-community";

import "ag-grid-community/styles/ag-grid.css";
import "@vuestic/ag-grid-theme";
import { useAdminUsersStore } from "~~/stores/admin/users";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridVue } from "ag-grid-vue3";
import { storeToRefs } from "pinia";

import CsUserActionsCell from "~/components/(pages)/(admin)/(users)/cs-user-actions-cell.vue";

definePageMeta({
  middleware: ["admin-logged-in"],
});

ModuleRegistry.registerModules([AllCommunityModule]);

const { locale, t } = useI18n();
const { localeText } = useAgGridLocale();

const usersStore = useAdminUsersStore();
const { users } = storeToRefs(usersStore);
usersStore.refreshUsers();
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
    headerName: t("grids.admin.users.columns.id"),
    width: 100,
  },
  {
    field: "name",
    headerName: t("grids.admin.users.columns.name"),
  },
  {
    field: "email",
    headerName: t("grids.admin.users.columns.email"),
  },
  {
    field: "createdAt",
    headerName: t("grids.admin.users.columns.created_at"),
    valueFormatter: params => numberToDateFormatter(params.data?.createdAt),
  },
  {
    field: "actions",
    headerName: t("grids.admin.users.columns.actions"),
    cellRenderer: CsUserActionsCell,
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
</script>

<template>
  <div class="container">
    <CsBrandingHeader />
    <div style="height: 500px; width: 100%;">
      <AgGridVue
        :key="locale"
        data-grid-name="grids.admin.users"
        style="height: 100%; width: 100%;"
        class="ag-theme-vuestic"
        theme="legacy"
        :column-defs="colDefs"
        :row-data="users"
        :default-col-def="defaultColDef"
        :locale-text="localeText"
        :pagination="true"
        :pagination-page-size="10"
        :pagination-page-size-selector="[10, 20, 50, 100]"
        :animate-rows="true"
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
