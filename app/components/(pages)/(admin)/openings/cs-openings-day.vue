<script setup lang="ts">
type Props = {
  data: {
    id: number;
    dayOfWeek: number;
    startHour: number;
    endHour: number;
    availableLanes: number;
  }[];
};
defineProps<Props>();
</script>

<template>
  <VaCard class="card">
    <VaCardTitle>
      Kedd
    </VaCardTitle>
    <VaCardContent>
      <VaList>
        <VaListItem v-for="(item) in data" :key="item.id ">
          <template #default>
            {{ item.startHour }} - {{ item.endHour }}
            {{ item.availableLanes }} {{ $t("common.lanes") }}
          </template>
        </VaListItem>
      </VaList>
    </VaCardContent>
  </VaCard>
</template>

<style lang="scss" scoped>
.grid-container {
  width: 100%;
  min-height: 200px;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: auto;
  justify-content: center;
}
</style>
