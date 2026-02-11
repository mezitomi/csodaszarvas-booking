<script setup lang="ts">
const { t } = useI18n();
const title = t("brand_name");
useHead({
  title,
  titleTemplate: null,
});

const localePath = useLocalePath();
</script>

<template>
  <div class="container">
    <CsArrowSeparator lenght="medium" class="arrow-separator">
      <template #default>
        <h1>{{ $t("brand_name") }}</h1>
      </template>
    </CsArrowSeparator>
    <VaButton
      preset="secondary"
      text-color="#fff"
      :to="localePath('booking')"
    >
      {{ t(`navbar.booking`) }}
    </VaButton>
  </div>
</template>

<style lang="scss" scoped>
.container {
  max-inline-size: 1000px;
  margin-inline: auto;
}
</style>
