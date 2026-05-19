<script setup lang="ts">
import { useAuthStore } from "~~/stores/auth";

const authStore = useAuthStore();
const { t } = useI18n();
</script>

<template>
  <VaButton
    @click="authStore.googleSignIn"
  >
    {{ t("pages.login.google_sign_in") }}
    <VaProgressCircle
      v-if="authStore.loading"
      color="secondary"
      size="1rem"
      thickness="0.3"
      indeterminate
    />
    <Icon v-else name="tabler:brand-google" />
  </VaButton>
</template>
