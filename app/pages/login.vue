<script setup lang="ts">
import { mapAuthErrorMessage, requiresEmailVerification } from "~~/app/utils/auth-error";
import { useAuthStore } from "~~/stores/auth";

import CsGoogleAuthButton from "~/components/cs-google-auth-button.vue";

const localePath = useLocalePath();

const authStore = useAuthStore();
if (authStore.user) {
  navigateTo(localePath("/"));
}

const form = reactive({
  email: "",
  password: "",
  rememberMe: true,
});
const errorMessage = ref("");
const isSubmitting = ref(false);
const { t } = useI18n();

async function onSubmit() {
  if (isSubmitting.value)
    return;

  isSubmitting.value = true;
  errorMessage.value = "";

  const { error } = await authStore.signInWithEmail({
    email: form.email,
    password: form.password,
    rememberMe: form.rememberMe,
  });

  isSubmitting.value = false;

  if (error) {
    if (requiresEmailVerification(error)) {
      await navigateTo(localePath({
        name: "verify-email",
        query: {
          email: form.email,
          status: "sent",
        },
      }));
      return;
    }

    errorMessage.value = mapAuthErrorMessage(error, t);
    return;
  }

  await navigateTo(localePath("/"));
}

const title = t("brand_name");
useHead({
  title,
  titleTemplate: null,
});
</script>

<template>
  <div class="container">
    <CsBrandingHeader />
    <p>{{ t("pages.login.title") }}</p>

    <form class="auth-form" @submit.prevent="onSubmit">
      <VaAlert
        v-if="errorMessage"
        color="danger"
        class="alert"
        closeable
      >
        {{ errorMessage }}
      </VaAlert>

      <VaInput
        v-model="form.email"
        type="email"
        :label="t('pages.login.email')"
        autocomplete="email"
        required
      />

      <VaInput
        v-model="form.password"
        type="password"
        :label="t('pages.login.password')"
        autocomplete="current-password"
        required
      />

      <VaCheckbox
        v-model="form.rememberMe"
        :label="t('pages.login.remember_me')"
      />

      <VaButton
        type="submit"
        :loading="isSubmitting"
        block
      >
        {{ t("pages.login.submit") }}
      </VaButton>
    </form>

    <div class="links">
      <VaButton preset="secondary" :to="localePath('signup')">
        {{ t("pages.login.create_account") }}
      </VaButton>
      <VaButton preset="secondary" :to="localePath('forgot-password')">
        {{ t("pages.login.forgot_password") }}
      </VaButton>
    </div>

    <CsGoogleAuthButton />
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

.alert {
  margin-block-end: 0.25rem;
}

.links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}
</style>
