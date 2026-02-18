<script setup lang="ts">
import type { UserType } from "~~/lib/db/schema/auth";
import type { InsertPassType } from "~~/lib/db/schema/pass";

import { useForm } from "vuestic-ui";

const emit = defineEmits<Emits>();
const formRef = ref();
const { isValid, validate } = useForm(formRef);
const { t } = useI18n();
const { weekdayNames, firstWeekday, monthNames } = useDatePickerLocale();

type FormContentType = {
  userId?: number;
  creditType?: string | null;
  creditsTotal?: number;
  expiresAt?: number;
  user?: UserType;
};

type Emits = {
  (e: "submit", passData: InsertPassType): void;
};

const formContent = ref<FormContentType>({
  userId: undefined,
  creditType: CREDIT_TYPE_RENTAL,
  creditsTotal: 12,
  expiresAt: new Date().getTime() + PASS_EXPIRATION_MS,
  user: undefined,
});

const creditTypeOptions = computed(() => [
  {
    text: t("common.credit_types.regular"),
    value: CREDIT_TYPE_REGULAR,
  },
  {
    text: t("common.credit_types.regular_with_rental"),
    value: CREDIT_TYPE_RENTAL,
  },
]);

const creditTypeModel = computed({
  get: () => {
    if (!formContent.value.creditType)
      return undefined;
    return creditTypeOptions.value.find(
      opt => opt.value === formContent.value.creditType,
    );
  },
  set: (val) => {
    if (val) {
      formContent.value.creditType = val.value;
    }
    else {
      formContent.value.creditType = null;
    }
  },
});

function handleSelectUser(user: UserType) {
  formContent.value.user = user;
  formContent.value.userId = user.id;
}

function submit() {
  if (!isValid.value) {
    return;
  }

  const { ...passData } = formContent.value as InsertPassType;
  emit("submit", passData);
}
</script>

<template>
  <VaForm
    ref="formRef"
    data-form-name="forms.admin.passes.issue"
    :model="formContent"
    class="pass-form"
  >
    {{ $t("forms.admin.passes.issue.user") }}:
    <VaFormField
      :model-value="formContent.user"
      :rules="[(v) => !!v]"
      required
    >
      <CsSelectPassUserModal
        :modal-value="formContent.user"
        @select-user="handleSelectUser"
      />
    </VaFormField>
    {{ $t("forms.admin.passes.issue.credit_type") }}:
    <VaSelect
      v-model="creditTypeModel"
      :options="creditTypeOptions"
      track-by="value"
      text-by="text"
      clearable
      :rules="[(v) => !!v]"
      required
    />

    {{ $t("forms.admin.passes.issue.credits_total") }}:
    <VaInput
      v-model="formContent.creditsTotal"
      type="number"
      :rules="[(v) => !!v && Number(v) > 0]"
      required
    />
    {{ $t("forms.admin.passes.issue.expires_at") }}:
    <VaDateInput
      v-model="formContent.expiresAt"
      show-other-months
      :rules="[(v) => !!v]"
      required
      clearable
      :first-weekday="firstWeekday"
      :weekday-names="weekdayNames"
      :month-names="monthNames"
    />
    <VaButton preset="primary" @click="validate() && submit()">
      {{ $t("forms.save") }}
    </VaButton>
  </VaForm>
</template>
