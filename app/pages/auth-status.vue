<script setup lang="ts">
import { mapAuthErrorMessage } from "~~/app/utils/auth-error";

const route = useRoute();
const localePath = useLocalePath();
const { t } = useI18n();

const verificationErrorCode = computed(() => {
  if (typeof route.query.error !== "string")
    return "";

  return route.query.error;
});

const callbackStatus = computed(() => {
  if (typeof route.query.status !== "string")
    return "";

  return route.query.status;
});

const state = computed(() => {
  if (typeof route.query.state === "string")
    return route.query.state;

  if (callbackStatus.value === "verified" || verificationErrorCode.value)
    return "verify-email";

  return "forgot-requested";
});

const stateConfig = computed(() => {
  switch (state.value) {
    case "verify-email":
      if (verificationErrorCode.value) {
        return {
          tone: "warning",
          titleKey: "pages.auth_status.verify_email_failed.title",
          message: mapAuthErrorMessage({ code: verificationErrorCode.value }, t),
          ctaTo: localePath("verify-email"),
          ctaKey: "pages.auth_status.cta_resend_verification",
        };
      }

      return {
        tone: "success",
        titleKey: "pages.auth_status.verify_email_success.title",
        messageKey: "pages.auth_status.verify_email_success.message",
        ctaTo: localePath("login"),
        ctaKey: "pages.auth_status.cta_to_login",
      };
    case "signup-created":
      return {
        tone: "success",
        titleKey: "pages.auth_status.signup_created.title",
        messageKey: "pages.auth_status.signup_created.message",
        ctaTo: localePath("login"),
        ctaKey: "pages.auth_status.cta_to_login",
      };
    case "reset-success":
      return {
        tone: "success",
        titleKey: "pages.auth_status.reset_success.title",
        messageKey: "pages.auth_status.reset_success.message",
        ctaTo: localePath("login"),
        ctaKey: "pages.auth_status.cta_to_login",
      };
    case "reset-token-expired":
      return {
        tone: "warning",
        titleKey: "pages.auth_status.reset_token_expired.title",
        messageKey: "pages.auth_status.reset_token_expired.message",
        ctaTo: localePath("forgot-password"),
        ctaKey: "pages.auth_status.cta_request_new_link",
      };
    case "forgot-requested":
    default:
      return {
        tone: "success",
        titleKey: "pages.auth_status.forgot_requested.title",
        messageKey: "pages.auth_status.forgot_requested.message",
        ctaTo: localePath("login"),
        ctaKey: "pages.auth_status.cta_to_login",
      };
  }
});

useHead({
  title: t("brand_name"),
  titleTemplate: null,
});
</script>

<template>
  <div class="container">
    <CsBrandingHeader />

    <div class="status-content">
      <h1>{{ t(stateConfig.titleKey) }}</h1>

      <p class="status-message">
        {{ stateConfig.message ?? t(stateConfig.messageKey) }}
      </p>

      <VaButton preset="secondary" :to="stateConfig.ctaTo">
        {{ t(stateConfig.ctaKey) }}
      </VaButton>
    </div>
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

.status-content {
  inline-size: min(32rem, 92vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;

  h1 {
    margin: 0;
    font-size: 1.375rem;
  }
}

.status-message {
  margin: 0;
  inline-size: 100%;
  color: var(--va-text-primary);
}
</style>
