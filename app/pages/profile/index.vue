<script setup lang="ts">
import { mapAuthErrorMessage } from "~~/app/utils/auth-error";
import { useAuthStore } from "~~/stores/auth";
import { usePassesStore } from "~~/stores/passes";
import { to } from "await-to-js";

definePageMeta({
  middleware: ["logged-in"],
});
const authStore = useAuthStore();
const passesStore = usePassesStore();
const { passes } = storeToRefs(passesStore);
const { t } = useI18n();
const title = t("brand_name");
const localePath = useLocalePath();
const route = useRoute();

useHead({
  title,
  titleTemplate: null,
});

// During SSR, wait for user to be available
const user = computed(() => authStore.user);
const linkingGoogle = ref(false);
const linkError = ref("");

watchEffect(() => {
  const queryError = typeof route.query.error === "string" ? route.query.error : "";

  if (!queryError)
    return;

  linkError.value = mapAuthErrorMessage({ code: queryError }, t);
});

async function handleLogout() {
  await authStore.signOut();
  await navigateTo(localePath("login"));
}

async function handleLinkGoogle() {
  if (linkingGoogle.value)
    return;

  linkingGoogle.value = true;
  linkError.value = "";

  const profilePath = localePath("profile");
  const profileErrorPath = localePath({
    name: "profile",
    query: {
      source: "link-google",
    },
  });

  const [error] = await to(authStore.linkGoogle(profilePath, profileErrorPath));
  linkingGoogle.value = false;

  if (error) {
    // TODO hát ez a typing se túl szép, refaktorálni kéne
    const mappedError = (typeof error === "object" && error && "error" in error)
      ? (error as { error?: { code?: string; message?: string; status?: number } }).error
      : (error as { code?: string; message?: string; status?: number });

    linkError.value = mapAuthErrorMessage(mappedError, t);
  }
}

// Only fetch passes after user is loaded
watchEffect(() => {
  if (user.value) {
    passesStore.refreshPasses();
  }
});
</script>

<template>
  <div class="container">
    <CsBrandingHeader />
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
              <p>
                {{ $t(`common.credit_types.${pass.creditType}`) }}
              </p>
              <p>
                {{ $t("pages.booking.credits_remaining") }}: {{ pass.creditsRemaining }}
              </p>
              <p>{{ $t("pages.booking.expires_at") }}: {{ new Date(pass.expiresAt).toLocaleDateString() }}</p>
            </li>
          </ul>
        </VaCardContent>
        <VaCardContent v-else>
          <p>{{ $t("pages.profile.no_passes") }}</p>
        </VaCardContent>
      </VaCard>
    </div>
    <VaButton @click="handleLogout">
      {{ $t("pages.profile.logout") }}
    </VaButton>
    <VaAlert
      v-if="linkError"
      color="danger"
      closeable
    >
      {{ linkError }}
    </VaAlert>
    <VaButton :loading="linkingGoogle" @click="handleLinkGoogle">
      {{ $t("pages.profile.link_google") }}
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
  gap: 1rem;
  padding-block-end: 1rem;
}

.cards {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.va-card {
  @media (min-width: 575px) {
    cursor: pointer;
    transition: transform 0.2s ease-in-out;

    &:hover {
      transform: translateY(-5px);
    }
  }

  inline-size: 300px;
  p {
    margin-bottom: 0.25rem;
  }

  li {
    margin-bottom: 1rem;
  }
}
</style>
