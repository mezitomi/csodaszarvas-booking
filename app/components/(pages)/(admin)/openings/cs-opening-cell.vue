<script setup lang="ts">
import type { OpeningType } from "~~/lib/db/schema";

type Props = {
  opening: OpeningType | undefined;
  updating: boolean;
  dayOfWeek: number;
  startHour: number;
};

const props = defineProps<Props>();
const emit = defineEmits<{
  update: [lanes: number];
  create: [dayOfWeek: number, startHour: number, lanes: number];
}>();

const { t } = useI18n();
const isEditing = ref(false);
const inputValue = ref("");
const errorMsg = ref("");

const displayValue = computed(() => {
  if (!props.opening || props.opening.availableLanes === 0)
    return "-";
  return String(props.opening.availableLanes);
});

function startEdit() {
  isEditing.value = true;
  inputValue.value = props.opening ? String(props.opening.availableLanes) : "";
  errorMsg.value = "";
}

function cancelEdit() {
  isEditing.value = false;
  inputValue.value = "";
  errorMsg.value = "";
}

async function saveEdit() {
  const num = Number.parseInt(inputValue.value, 10);

  if (Number.isNaN(num) || num < 0) {
    errorMsg.value = t("pages.admin.openings.validation.invalid_lanes");
    return;
  }

  isEditing.value = false;
  errorMsg.value = "";

  if (props.opening) {
    emit("update", num);
  }
  else {
    emit("create", props.dayOfWeek, props.startHour, num);
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Enter")
    saveEdit();
  else if (e.key === "Escape")
    cancelEdit();
}

function handleInputBlur() {
  if (isEditing.value)
    saveEdit();
}
</script>

<template>
  <div class="cell" :class="{ updating, closed: !opening || opening.availableLanes === 0 }">
    <template v-if="isEditing">
      <input
        v-model="inputValue"
        type="number"
        min="0"
        class="cell-input"
        :disabled="updating"
        autofocus
        @keydown="handleKeydown"
        @blur="handleInputBlur"
      >
    </template>
    <template v-else-if="updating">
      <div class="cell-loading">
        <CsDeerLoader />
      </div>
    </template>
    <template v-else>
      <button
        class="cell-button"
        @click="startEdit"
      >
        {{ displayValue }}
      </button>
    </template>

    <div v-if="errorMsg" class="cell-error">
      {{ errorMsg }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cell {
  position: relative;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;

  &.closed {
    background-color: rgba(var(--va-background-border), 0.1);

    .cell-button {
      opacity: 0.6;
    }
  }

  &.updating {
    opacity: 0.6;
  }
}

.cell-button {
  background: none;
  border: 1px solid transparent;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: inherit;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: rgba(var(--va-primary), 0.1);
    border-color: rgba(var(--va-primary), 0.3);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.cell-input {
  width: 60px;
  padding: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  border: 2px solid rgba(var(--va-primary), 0.5);
  border-radius: 4px;
  text-align: center;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgba(var(--va-primary), 1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.cell-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  :deep(.deer-loader) {
    transform: scale(0.5);
  }
}

.cell-error {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: rgba(var(--va-danger), 0.1);
  color: rgba(var(--va-danger), 1);
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 2px;
  white-space: nowrap;
  margin-top: 0.25rem;
}
</style>
