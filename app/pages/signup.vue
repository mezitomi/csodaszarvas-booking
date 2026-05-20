<script setup lang="ts">
import { mapAuthErrorMessage } from "~~/app/utils/auth-error";
import { useAuthStore } from "~~/stores/auth";

const authStore = useAuthStore();
const localePath = useLocalePath();
const { t } = useI18n();

if (authStore.user) {
  navigateTo(localePath("/"));
}

const form = reactive({
  name: "",
  email: "",
  password: "",
});
const isSubmitting = ref(false);
const errorMessage = ref("");

function emailRule(v: string) {
  const pattern = /^[\w.-]+@[a-z0-9.-]+\.[a-z]{2,6}$/i;
  return pattern.test(v.trim()) || t("pages.signup.invalid_email");
}

const emailRules = [emailRule, (v: string) => !!v || t("pages.signup.email_required")];

async function onSubmit() {
  if (isSubmitting.value)
    return;

  isSubmitting.value = true;
  errorMessage.value = "";

  const { error } = await authStore.signUpWithEmail({
    name: form.name.trim(),
    email: form.email.trim(),
    password: form.password.trim(),
  }, localePath({ name: "auth-status", query: { state: "verify-email" } }));

  isSubmitting.value = false;

  if (error) {
    errorMessage.value = mapAuthErrorMessage(error, t);
    return;
  }

  await navigateTo(localePath({ name: "auth-status", query: { state: "signup-created" } }));
}

useHead({
  title: t("brand_name"),
  titleTemplate: null,
});
</script>

<template>
  <div class="container">
    <CsBrandingHeader />
    <p>{{ t("pages.signup.title") }}</p>

    <form class="auth-form" @submit.prevent="onSubmit">
      <VaAlert
        v-if="errorMessage"
        color="danger"
        closeable
      >
        {{ errorMessage }}
      </VaAlert>

      <VaInput
        v-model="form.name"
        :label="t('pages.signup.name')"
        autocomplete="name"
        required
      />

      <VaInput
        v-model="form.email"
        type="email"
        :label="t('pages.signup.email')"
        autocomplete="email"
        required
        :rules="emailRules"
      />

      <VaInput
        v-model="form.password"
        type="password"
        :label="t('pages.signup.password')"
        autocomplete="new-password"
        required
        :rules="[(pw) => pw.trim().length >= 8 && pw.trim().length <= 128 || t('pages.signup.password_requirements')]"
      />

      <VaButton
        type="submit"
        :loading="isSubmitting"
        block
      >
        {{ t("pages.signup.submit") }}
      </VaButton>
    </form>

    <VaButton preset="secondary" :to="localePath('login')">
      {{ t("pages.signup.back_to_login") }}
    </VaButton>
  </div>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-block-start: 2%;
  gap: 1rem;
}

.auth-form {
  inline-size: min(26rem, 90%);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

:deep(.va-input-wrapper__size-keeper) {
  inline-size: unset;
  min-inline-size: unset;
  max-inline-size: unset;
}
</style>
