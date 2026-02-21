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
    <div class="cards">
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
  </div>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;

  gap: 50px;
  margin: auto;
  max-inline-size: 1000px;

  .arrow-separator {
    margin-bottom: 0;
  }

  .cards {
    display: flex;
    gap: 20px;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .va-card {
    cursor: pointer;
    transition: transform 0.2s ease-in-out;

    &:hover {
      transform: translateY(-5px);
    }
    inline-size: 300px;
  }
}
</style>
