<script setup lang="ts">
import { useAuthStore } from "~~/stores/auth";

definePageMeta({
  middleware: ["route"],
});
const authStore = useAuthStore();
const { t } = useI18n();
const title = t("brand_name");
useHead({
  title,
  titleTemplate: null,
});

const user = authStore.user!;
</script>

<template>
  <div class="container">
    <CsArrowSeparator lenght="medium" class="arrow-separator">
      <template #default>
        <h3>
          {{ $t("brand_name") }}
        </h3>
      </template>
    </CsArrowSeparator>
    <h3>
      {{ $t("pages.profile.greeting") }} {{ user.name }}
    </h3>
    <VaSeparator class="separator" />
    <VaCard class="profile-card">
      <VaCardContent>
        <p> {{ $t("pages.profile.name") }}: {{ user.name }}</p>
        <p> {{ $t("pages.profile.email") }}: {{ user.email }}</p>
        <p>{{ $t("pages.profile.registered_at") }}: {{ new Date(user.createdAt).toLocaleDateString() }}</p>
      </VaCardContent>
    </VaCard>
    <VaButton @click="authStore.signOut">
      {{ $t("pages.profile.logout") }}
    </VaButton>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
