<script setup lang="ts">
import { mapAuthErrorMessage } from "~~/app/utils/auth-error";
import { useAuthStore } from "~~/stores/auth";

const authStore = useAuthStore();
const route = useRoute();
const localePath = useLocalePath();

const token = computed(() => typeof route.query.token === "string" ? route.query.token : "");
const newPassword = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");

const { t } = useI18n();

function isExpiredOrInvalidTokenError(error: { code?: string; status?: number } | null | undefined) {
  const errorCode = error?.code?.toLowerCase();
  return errorCode === "invalid_token" || errorCode === "token_expired";
}

async function onSubmit() {
  if (isSubmitting.value)
    return;

  if (!token.value) {
    await navigateTo(localePath({ name: "auth-status", query: { state: "reset-token-expired" } }));
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = "";

  const { error } = await authStore.resetPassword(token.value, newPassword.value);

  isSubmitting.value = false;

  if (error) {
    if (isExpiredOrInvalidTokenError(error)) {
      await navigateTo(localePath({ name: "auth-status", query: { state: "reset-token-expired" } }));
      return;
    }

    errorMessage.value = mapAuthErrorMessage(error, t);
    return;
  }

  await navigateTo(localePath({ name: "auth-status", query: { state: "reset-success" } }));
}

useHead({
  title: t("brand_name"),
  titleTemplate: null,
});
</script>

<template>
  <div class="container">
    <CsBrandingHeader />
    <p>{{ t("pages.reset_password.title") }}</p>

    <form class="auth-form" @submit.prevent="onSubmit">
      <VaAlert
        v-if="errorMessage"
        color="danger"
        closeable
      >
        {{ errorMessage }}
      </VaAlert>

      <VaInput
        v-model="newPassword"
        type="password"
        :label="t('pages.reset_password.new_password')"
        autocomplete="new-password"
        required
      />

      <VaButton
        type="submit"
        :loading="isSubmitting"
        block
      >
        {{ t("pages.reset_password.submit") }}
      </VaButton>
    </form>

    <VaButton preset="secondary" :to="localePath('login')">
      {{ t("pages.reset_password.back_to_login") }}
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
