<script setup lang="ts">
definePageMeta({
  middleware: ["admin-logged-in"],
});
</script>

<template>
  <div class="container">
    <CsArrowSeparator lenght="medium" class="arrow-separator">
      <template #default>
        <h3>
          {{ $t("pages.admin.title") }}
        </h3>
      </template>
    </CsArrowSeparator>
    <VaCard @click="navigateTo($localePath('admin-users'))">
      <VaCardTitle>{{ $t('pages.admin.tiles.users.title') }}</VaCardTitle>
      <VaCardContent>
        <p>{{ $t('pages.admin.tiles.users.description') }}</p>
      </VaCardContent>
    </VaCard>
    <VaCard @click="navigateTo($localePath('admin-passes'))">
      <VaCardTitle>{{ $t('pages.admin.tiles.passes.title') }}</VaCardTitle>
      <VaCardContent>
        <p>{{ $t('pages.admin.tiles.passes.description') }}</p>
      </VaCardContent>
    </VaCard>
  </div>
</template>
