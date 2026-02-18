<script setup lang="ts">
import type { PassTypeWithUser } from "~~/lib/db/queries/passes";
import type { UpdatePassType } from "~~/lib/db/schema";

import { useForm } from "vuestic-ui";

type Props = {
  modelValue: PassTypeWithUser;
};

type Emits = {
  (e: "cancel"): void;
  (e: "submit", pass: UpdatePassType): void;
};

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const formRef = ref();
const { isValid, validate } = useForm(formRef);
const { t } = useI18n();
const { weekdayNames, firstWeekday, monthNames } = useDatePickerLocale();

const formContent = ref<PassTypeWithUser>(props.modelValue);

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
    return creditTypeOptions.value.find(
      opt => opt.value === formContent.value.creditType,
    );
  },
  set: (val) => {
    if (!val)
      return;

    formContent.value.creditType = val.value;
  },
});

async function submit() {
  if (!isValid.value) {
    return;
  }

  const dataToSubmit = {
    id: formContent.value.id,
    userId: formContent.value.userId,
    creditType: formContent.value.creditType,
    creditsTotal: formContent.value.creditsTotal,
    creditsRemaining: formContent.value.creditsRemaining,
    expiresAt: formContent.value.expiresAt,
  } as UpdatePassType;

  emit("submit", dataToSubmit);
}
</script>

<template>
  <VaForm
    ref="formRef"
    data-form-name="forms.admin.passes.edit"
    :model="formContent"
    class="pass-form"
  >
    {{ $t("forms.admin.passes.edit.user") }}:
    <VaInput
      readonly
      :model-value="formContent.user?.name"
    />

    {{ $t("forms.admin.passes.edit.credit_type") }}:
    <VaSelect
      v-model="creditTypeModel"
      :options="creditTypeOptions"
      track-by="value"
      text-by="text"
      clearable
      :rules="[(v) => !!v]"
      required
    />

    {{ $t("forms.admin.passes.edit.credits_total") }}:
    <VaInput
      v-model="formContent.creditsTotal"
      type="number"
      :rules="[(v) => !!v]"
      required
    />

    {{ $t("forms.admin.passes.edit.credits_remaining") }}:
    <VaInput
      v-model="formContent.creditsRemaining"
      type="number"
      :rules="[(v) => !!v]"
      required
    />

    {{ $t("forms.admin.passes.edit.expires_at") }}:
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
    <VaButton preset="secondary" @click="emit('cancel')">
      {{ $t("forms.cancel") }}
    </VaButton>
    <VaButton preset="primary" @click="validate() && submit()">
      {{ $t("forms.save") }}
    </VaButton>
  </VaForm>
</template>
