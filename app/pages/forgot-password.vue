<script setup lang="ts">
import { mapAuthErrorMessage } from "~~/app/utils/auth-error";
import { useAuthStore } from "~~/stores/auth";

const authStore = useAuthStore();
const localePath = useLocalePath();
const route = useRoute();

const email = ref(typeof route.query.email === "string" ? route.query.email : "");
const isSubmitting = ref(false);
const errorMessage = ref("");

const { t } = useI18n();

async function onSubmit() {
  if (isSubmitting.value)
    return;

  isSubmitting.value = true;
  errorMessage.value = "";

  const redirectTo = `${window.location.origin}${localePath("reset-password")}`;
  const { error } = await authStore.requestPasswordReset(email.value, redirectTo);

  isSubmitting.value = false;

  if (error) {
    errorMessage.value = mapAuthErrorMessage(error, t);
    return;
  }

  await navigateTo(localePath({ name: "auth-status", query: { state: "forgot-requested" } }));
}

useHead({
  title: t("brand_name"),
  titleTemplate: null,
});
</script>

<template>
  <div class="container">
    <CsBrandingHeader />
    <p>{{ t("pages.forgot_password.title") }}</p>

    <form class="auth-form" @submit.prevent="onSubmit">
      <VaAlert
        v-if="errorMessage"
        color="danger"
        closeable
      >
        {{ errorMessage }}
      </VaAlert>

      <VaInput
        v-model="email"
        type="email"
        :label="t('pages.forgot_password.email')"
        autocomplete="email"
        required
      />

      <VaButton
        type="submit"
        :loading="isSubmitting"
        block
      >
        {{ t("pages.forgot_password.submit") }}
      </VaButton>
    </form>

    <VaButton preset="secondary" :to="localePath('login')">
      {{ t("pages.forgot_password.back_to_login") }}
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
  inline-size: min(26rem, 90vw);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
