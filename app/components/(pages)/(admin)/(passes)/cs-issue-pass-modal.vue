<script setup lang="ts">
import type { UserType } from "~~/lib/db/schema/auth";
import type { InsertPassType } from "~~/lib/db/schema/pass";

import { useForm } from "vuestic-ui";

const emit = defineEmits<Emits>();

const { $csrfFetch } = useNuxtApp();

type Emits = {
  (e: "update:passes"): void;
};
type ModalEditPassType = {
  userId?: number;
  creditType?: string | null;
  creditsTotal?: number;
  expiresAt?: number;
  user?: UserType;
};

const { t } = useI18n();
const issuePassForm = ref();
const { isValid, validate } = useForm(issuePassForm);

const modalContent = ref<ModalEditPassType & { user?: UserType }>({
  userId: undefined,
  creditType: CREDIT_TYPE_RENTAL,
  creditsTotal: 12,
  expiresAt: new Date().getTime() + 60 * 24 * 60 * 60 * 1000,
  user: undefined,
});
const showModal = ref(false);
whenever(() => showModal.value, () => {
  resetModalContent();
});

function handleSelectUser(user: UserType) {
  modalContent.value.user = user;
  modalContent.value.userId = user.id;
}

function submit() {
  if (!isValid.value) {
    return;
  }

  const { ...passData } = modalContent.value;
  createPass(passData as InsertPassType);
}

function createPass(pass: InsertPassType) {
  $csrfFetch(ROUTE_ADMIN_PASSES, {
    method: "POST",
    body: JSON.stringify(pass),
  }).then(() => {
    showModal.value = false;
    emit("update:passes");
  });
}

const creditTypeOptions = computed(() => [
  {
    text: t("pages.admin.passes.equipment_option_use_own"),
    value: CREDIT_TYPE_REGULAR,
  },
  {
    text: t("pages.admin.passes.equipment_option_rent"),
    value: CREDIT_TYPE_RENTAL,
  },
]);

const creditTypeModel = computed({
  get: () => {
    if (!modalContent.value.creditType)
      return undefined;
    return creditTypeOptions.value.find(
      opt => opt.value === modalContent.value.creditType,
    );
  },
  set: (val) => {
    if (val) {
      modalContent.value.creditType = val.value;
    }
    else {
      modalContent.value.creditType = null;
    }
  },
});

function resetModalContent() {
  modalContent.value = {
    userId: undefined,
    creditType: CREDIT_TYPE_RENTAL,
    creditsTotal: 12,
    expiresAt: new Date().getTime() + 60 * 24 * 60 * 60 * 1000,
    user: undefined,
  };
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
      <VaForm
        ref="issuePassForm"
        :model="modalContent"
        class="pass-form"
      >
        {{ $t("pages.admin.passes.fields.user") }}:
        <VaFormField
          :model-value="modalContent.user"
          :rules="[(v) => !!v]"
          required
        >
          <CsSelectUserModal
            :modal-value="modalContent.user"
            @select-user="handleSelectUser"
          />
        </VaFormField>
        {{ $t("pages.admin.passes.fields.credit_type") }}:
        <VaSelect
          v-model="creditTypeModel"
          :options="creditTypeOptions"
          track-by="value"
          text-by="text"
          placeholder="Válassz típust"
          clearable
          :rules="[(v) => !!v]"
          required
        />

        {{ $t("pages.admin.passes.fields.credits_total") }}:
        <VaInput
          v-model="modalContent.creditsTotal"
          type="number"
          :rules="[(v) => !!v || t('pages.admin.passes.validations.credits_total_required')]"
          required
        />
        {{ $t("pages.admin.passes.fields.expires_at") }}:
        <VaDateInput
          v-model="modalContent.expiresAt"
          show-other-months
          :rules="[(v) => !!v]"
          required
          clearable
        />
        <VaButton preset="primary" @click="validate() && submit()">
          {{ $t("pages.admin.passes.save") }}
        </VaButton>
      </VaForm>
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
