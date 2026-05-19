<script setup lang="ts">
import { mapAuthErrorMessage } from "~~/app/utils/auth-error";
import { useAuthStore } from "~~/stores/auth";

const authStore = useAuthStore();
const route = useRoute();
const localePath = useLocalePath();
const { t } = useI18n();

const email = ref(typeof route.query.email === "string" ? route.query.email : "");
const errorQuery = computed(() => typeof route.query.error === "string" ? route.query.error : "");

const isSubmitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const callbackStatus = computed(() => typeof route.query.status === "string" ? route.query.status : "");

if (callbackStatus.value === "verified" || errorQuery.value) {
  await navigateTo(localePath({
    name: "auth-status",
    query: {
      state: "verify-email",
      ...(errorQuery.value ? { error: errorQuery.value } : {}),
    },
  }), { replace: true });
}

async function resendVerificationEmail() {
  if (isSubmitting.value || !email.value)
    return;

  isSubmitting.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  const { error } = await authStore.sendVerificationEmail(email.value, localePath({ name: "auth-status", query: { state: "verify-email" } }));
  isSubmitting.value = false;

  if (error) {
    errorMessage.value = mapAuthErrorMessage(error, t);
    return;
  }

  successMessage.value = t("pages.verify_email.sent");
}

useHead({
  title: t("brand_name"),
  titleTemplate: null,
});
</script>

<template>
  <div class="container">
    <CsBrandingHeader />
    <p>{{ t("pages.verify_email.title") }}</p>

    <VaAlert
      v-if="errorMessage"
      color="danger"
      closeable
    >
      {{ errorMessage }}
    </VaAlert>

    <VaAlert
      v-if="successMessage"
      color="success"
      closeable
    >
      {{ successMessage }}
    </VaAlert>

    <form class="auth-form" @submit.prevent="resendVerificationEmail">
      <VaInput
        v-model="email"
        type="email"
        :label="t('pages.verify_email.email')"
        autocomplete="email"
        required
      />

      <VaButton
        type="submit"
        :loading="isSubmitting"
        :disabled="!email"
        block
      >
        {{ t("pages.verify_email.resend") }}
      </VaButton>
    </form>

    <VaButton preset="secondary" :to="localePath('login')">
      {{ t("pages.verify_email.back_to_login") }}
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
