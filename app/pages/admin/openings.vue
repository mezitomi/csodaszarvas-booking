<script setup lang="ts">
import type { OpeningType } from "~~/lib/db/schema";

import { useAdminOpeningsStore } from "~~/stores/admin/openings";
import { to } from "await-to-js";

definePageMeta({
  middleware: ["admin-logged-in"],
});

const openingsStore = useAdminOpeningsStore();
const { openings, updatingId } = storeToRefs(openingsStore);
const { $csrfFetch } = useNuxtApp();

const START_HOUR = 10;
const END_HOUR = 19;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
const DAYS = [
  { key: 1, name: "monday" },
  { key: 2, name: "tuesday" },
  { key: 3, name: "wednesday" },
  { key: 4, name: "thursday" },
  { key: 5, name: "friday" },
  { key: 6, name: "saturday" },
  { key: 0, name: "sunday" },
];

openingsStore.refreshOpenings();

const openingsByDayAndHour = computed(() => {
  const result: Record<number, Record<number, OpeningType>> = {};

  openings.value?.forEach((opening) => {
    if (!result[opening.dayOfWeek]) {
      result[opening.dayOfWeek] = {};
    }
    result[opening.dayOfWeek]![opening.startHour] = opening;
  });

  return result;
});

function getOpening(dayOfWeek: number, hour: number): OpeningType | undefined {
  return openingsByDayAndHour.value[dayOfWeek]?.[hour];
}

async function handleCellUpdate(openingId: number, lanes: number) {
  await to(openingsStore.updateOpeningLanes(openingId, lanes));
}

async function handleCellCreate(dayOfWeek: number, startHour: number, lanes: number) {
  await to(openingsStore.createOpening(dayOfWeek, startHour, lanes));
}

const isGenerating = ref(false);

async function handleGenerateSlots() {
  isGenerating.value = true;
  const [err, result] = await to($csrfFetch("/api/admin/generate-slots", { method: "POST" }));
  isGenerating.value = false;
  if (err) {
    console.error("Slot generation failed", err);
  }
  else {
    console.warn("Slot generation result", result);
  }
}
</script>

<template>
  <div class="container">
    <CsArrowSeparator lenght="medium" class="arrow-separator">
      <template #default>
        <h3>
          {{ $t("pages.admin.openings.title") }}
        </h3>
      </template>
    </CsArrowSeparator>

    <div class="table-wrapper">
      <table class="openings-grid">
        <thead>
          <tr>
            <th class="hour-header" />
            <th
              v-for="day in DAYS"
              :key="day.key"
              class="day-header"
            >
              {{ $t(`pages.admin.openings.days.${day.name}`) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="hour in HOURS"
            :key="hour"
            class="hour-row"
          >
            <td class="hour-cell">
              {{ hour }}:00
            </td>
            <td
              v-for="day in DAYS"
              :key="day.key"
              class="data-cell"
            >
              <CsOpeningCell
                :opening="getOpening(day.key, hour)"
                :updating="updatingId === getOpening(day.key, hour)?.id || (updatingId === -1 && !getOpening(day.key, hour))"
                :day-of-week="day.key"
                :start-hour="hour"
                @update="(lanes) => {
                  const opening = getOpening(day.key, hour);
                  if (opening) handleCellUpdate(opening.id, lanes);
                }"
                @create="(dow, sh, lanes) => handleCellCreate(dow, sh, lanes)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="actions">
      <VaButton
        color="secondary"
        disabled
        title="Coming soon"
      >
        {{ $t("pages.admin.openings.special_hours") ?? "Speciális nyitvatartás" }}
      </VaButton>
      <VaButton
        color="primary"
        :loading="isGenerating"
        @click="handleGenerateSlots"
      >
        {{ $t("pages.admin.openings.generate_slots") ?? "Slotok generálása" }}
      </VaButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-inline-size: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

.arrow-separator {
  margin-bottom: 1rem;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid rgba(var(--va-background-border), 0.3);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.openings-grid {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;

  thead {
    background-color: rgba(var(--va-background-border), 0.1);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  th {
    padding: 1rem;
    text-align: center;
    font-weight: 600;
    color: rgba(var(--va-textPrimary), 0.8);
    border: 1px solid rgba(var(--va-background-border), 0.15);
  }

  tbody tr {
    border-bottom: 1px solid rgba(var(--va-background-border), 0.15);

    &:hover {
      background-color: rgba(var(--va-primary), 0.03);
    }
  }

  td {
    border: 1px solid rgba(var(--va-background-border), 0.15);
    padding: 0;
    vertical-align: middle;
  }
}

.hour-header {
  width: 56px;
  min-width: 56px;
}

.day-header {
  width: 80px;
  min-width: 80px;
}

.hour-cell {
  background-color: rgba(var(--va-background-border), 0.05);
  font-weight: 600;
  color: rgba(var(--va-textPrimary), 0.7);
  width: 56px;
  min-width: 56px;
  padding: 0.5rem !important;
  text-align: center;
  position: sticky;
  left: 0;
  z-index: 5;
}

.data-cell {
  min-height: 44px;
  width: 80px;
  min-width: 80px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

@media (max-width: 768px) {
  .container {
    padding: 0.5rem;
  }

  .openings-grid {
    font-size: 0.85rem;

    th,
    td {
      padding: 0.5rem !important;
    }
  }

  .hour-header,
  .day-header,
  .hour-cell,
  .data-cell {
    width: 100px !important;
    min-width: 100px !important;
  }
}
</style>
