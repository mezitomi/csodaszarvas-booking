<script setup lang="ts">
const { t } = useI18n();
const title = t("brand_name");

useHead({
  title,
  titleTemplate: null,
});
definePageMeta({
  middleware: ["route"],
});

const localePath = useLocalePath();
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
    <CsUpcomingBookings class="upcoming-bookings" />
    <div class="button-group">
      <VaButton :to="localePath('booking')">
        {{ $t("pages.index.make_booking") }}
      </VaButton>
      <VaButton :to="localePath('profile')">
        {{ $t("pages.index.profile") }}
      </VaButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  max-inline-size: 1000px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .arrow-separator,
  .greeting-card,
  .upcoming-bookings {
    margin-block-start: 2rem;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    margin-block-start: 2rem;
  }
}
</style>
