<script setup lang="ts">
import { useAuthStore } from "~~/stores/auth";
import { usePassesStore } from "~~/stores/passes";

definePageMeta({
  middleware: ["logged-in"],
});
const authStore = useAuthStore();
const passesStore = usePassesStore();
const { passes } = storeToRefs(passesStore);
const { t } = useI18n();
const title = t("brand_name");
useHead({
  title,
  titleTemplate: null,
});

passesStore.refreshPasses();

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

    <VaCard>
      <VaCardTitle>{{ $t("pages.profile.passes") }}</VaCardTitle>
      <VaCardContent v-if="passes && passes.length > 0">
        <p>{{ $t("pages.profile.passes_info") }}</p>
        <ul>
          <li v-for="pass in passes" :key="pass.id">
            {{ new Date(pass.createdAt).toLocaleDateString() }} - {{ new Date(pass.expiresAt).toLocaleDateString() }} - {{ pass.creditType }} - {{ pass.creditsRemaining }}
          </li>
        </ul>
      </VaCardContent>
      <VaCardContent v-else>
        <p>{{ $t("pages.profile.no_passes") }}</p>
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
