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

// During SSR, wait for user to be available
const user = computed(() => authStore.user);

// Only fetch passes after user is loaded
watchEffect(() => {
  if (user.value) {
    passesStore.refreshPasses();
  }
});
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
    <h3 v-if="user">
      {{ $t("pages.profile.greeting") }} {{ user.name }}
    </h3>
    <div class="cards">
      <VaCard v-if="user" class="va-card">
        <VaCardTitle>{{ $t("pages.profile.account_info") }}</VaCardTitle>
        <VaCardContent>
          <p> {{ $t("pages.profile.name") }}: {{ user.name }}</p>
          <p> {{ $t("pages.profile.email") }}: {{ user.email }}</p>
          <p>{{ $t("pages.profile.registered_at") }}: {{ new Date(user.createdAt).toLocaleDateString() }}</p>
        </VaCardContent>
      </VaCard>
      <VaCard class="va-card">
        <VaCardTitle>{{ $t("pages.profile.passes") }}</VaCardTitle>
        <VaCardContent v-if="passes && passes.length > 0">
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
    </div>
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
  max-inline-size: 1000px;
  inline-size: 80%;
  margin: auto;
  gap: 2rem;
}

.cards {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-direction: row;
  flex-wrap: wrap;
}

.va-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
  }
  inline-size: 300px;
}
</style>
