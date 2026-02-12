<script setup lang="ts">
import { useAuthStore } from "~~/stores/auth";

import CsGoogleAuthButton from "~/components/cs-google-auth-button.vue";

const localePath = useLocalePath();

const authStore = useAuthStore();
if (authStore.user) {
  navigateTo(localePath("/"));
}

const { t } = useI18n();
const title = t("brand_name");
useHead({
  title,
  titleTemplate: null,
});
</script>

<template>
  <div class="container">
    <CsArrowSeparator lenght="medium" class="arrow-separator">
      <template #default>
        <h1>{{ $t("brand_name") }}</h1>
      </template>
    </CsArrowSeparator>
    <p>{{ t("pages.login.title") }}</p>
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
}
</style>
