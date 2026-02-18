<script setup lang="ts">
import type { UserType } from "~~/lib/db/schema";
import type { ColDef } from "ag-grid-community";

import "ag-grid-community/styles/ag-grid.css";
import "@vuestic/ag-grid-theme";
import { useAdminUsersStore } from "~~/stores/admin/users";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridVue } from "ag-grid-vue3";

import CsSelectUserActionsCell from "~/components/(pages)/(admin)/(passes)/cs-select-user-action-cell.vue";

type SelectUserModalProps = {
  modalValue?: UserType;
};
const props = defineProps<SelectUserModalProps>();

const emit = defineEmits<{
  selectUser: [user: UserType];
}>();

ModuleRegistry.registerModules([AllCommunityModule]);

const showModal = ref(false);

const { locale, t } = useI18n();
const { localeText } = useAgGridLocale();

const colDefs = computed<ColDef[]>(() => [
  {
    field: "id",
    headerName: t("pages.admin.passes.columns.id"),
    width: 100,
  },
  {
    field: "name",
    headerName: t("pages.admin.passes.columns.user"),
  },
  {
    field: "email",
    headerName: t("pages.admin.users.columns.email"),
  },
  {
    field: "actions",
    headerName: t("pages.admin.passes.columns.actions"),
    cellRenderer: CsSelectUserActionsCell,
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

const usersStore = useAdminUsersStore();
const { users } = storeToRefs(usersStore);
usersStore.refreshUsers();

const gridOptions = computed(() => ({
  context: {
    onUserSelected: (user: UserType) => {
      emit("selectUser", user);
      showModal.value = false;
    },
  },
}));
</script>

<template>
  <VaModal
    v-model="showModal"
    :title="$t('pages.admin.passes.select_user')"
    closable
    hide-default-actions
  >
    <template #anchor>
      <VaInput
        readonly
        :rules="[(v) => !!v]"
        :model-value="props.modalValue?.name"
        required
        @click="showModal = true"
      />
    </template>
    <template #default>
      <div style="height: 300px; width: 100%;">
        <AgGridVue
          :key="locale"
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
          :context="gridOptions.context"
        />
      </div>
    </template>
  </VaModal>
</template>
