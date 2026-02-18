<script setup lang="ts">
import type { UserType } from "~~/lib/db/schema/auth";
import type { PassType, UpdatePassType } from "~~/lib/db/schema/pass";

import { useForm } from "vuestic-ui";

import { CREDIT_TYPE_REGULAR, CREDIT_TYPE_RENTAL, ROUTE_ADMIN_PASSES_ID } from "~/utils/constants";

const props = defineProps<ModalEditProps>();

const emit = defineEmits<Emits>();

const { $csrfFetch } = useNuxtApp();

type ModalEditProps = {
  modelValue: PassType | null;
  show: boolean;
};

type Emits = {
  (e: "update:passes"): void;
  (e: "update:show", value: boolean): void;
};
type ModalEditPassType = {
  id?: number;
  userId?: number;
  creditType?: string | null;
  creditsTotal?: number;
  creditsRemaining?: number;
  expiresAt?: number;
  createdAt?: number;
  updatedAt?: number;
  user?: UserType;
};

const { t } = useI18n();

const editPassForm = ref();
const { isValid, validate } = useForm(editPassForm);

const modalContent = ref<ModalEditPassType & { user?: UserType }>(
  { ...props.modelValue },
);

const showModal = computed({
  get: () => props.show,
  set: val => emit("update:show", val),
});

whenever(() => props.show, () => {
  modalContent.value = { ...props.modelValue };
});

async function submit() {
  if (!isValid.value) {
    return;
  }

  const dataToSubmit = {
    id: modalContent.value.id,
    userId: modalContent.value.userId,
    creditType: modalContent.value.creditType,
    creditsTotal: modalContent.value.creditsTotal,
    creditsRemaining: modalContent.value.creditsRemaining,
    expiresAt: modalContent.value.expiresAt,
  } as UpdatePassType;

  const path = ROUTE_ADMIN_PASSES_ID.replace("[passId]", String(modalContent.value.id));

  const result = await $csrfFetch(path, {
    method: "PUT",
    body: JSON.stringify(dataToSubmit),
  }).catch((err) => {
    console.error("Failed to update pass:", err);
    return null;
  });

  const updated = result as PassType | null;
  if (updated) {
    showModal.value = false;
    emit("update:passes");
  }
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
      <VaForm
        ref="editPassForm"
        :model="modalContent"
        class="pass-form"
      >
        {{ $t("pages.admin.passes.fields.user") }}:
        <VaInput
          readonly
          :model-value="modalContent.user?.name"
        />

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
          :rules="[(v) => !!v]"
          required
        />

        {{ $t("pages.admin.passes.fields.credits_remaining") }}:
        <VaInput
          v-model="modalContent.creditsRemaining"
          type="number"
          :rules="[(v) => !!v]"
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
        <VaButton preset="secondary" @click="showModal = false">
          {{ $t("pages.admin.passes.cancel") }}
        </VaButton>
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
