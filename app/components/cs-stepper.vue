<script setup lang="ts" generic="T extends Record<string, any>">
import { ref } from "vue";

type StepConfig = {
  label: string;
  beforeLeave?: (step: { hasError: boolean }) => Promise<void> | void;
  canProceed?: () => boolean;
  hasError?: boolean;
};

type Props = {
  modelValue: number;
  steps: StepConfig[];
  linear?: boolean;
  finishButtonHidden?: boolean;
  nextDisabledOnError?: boolean;
};

type Emits = {
  (e: "update:modelValue", value: number): void;
};

const props = withDefaults(defineProps<Props>(), {
  linear: true,
  finishButtonHidden: true,
  nextDisabledOnError: true,
});

const emit = defineEmits<Emits>();

const currentStepRef = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value),
});

const stepErrors = ref<Record<number, boolean>>({});

const isNextDisabled = computed(() => {
  const currentStep = props.steps[currentStepRef.value];

  if (!currentStep)
    return true;

  if (currentStep.canProceed && !currentStep.canProceed())
    return true;

  return props.nextDisabledOnError && Boolean(stepErrors.value[currentStepRef.value]);
});

async function validateStep(stepIndex: number): Promise<boolean> {
  const step = props.steps[stepIndex];
  if (!step || !step.beforeLeave)
    return true;

  const stepValidation = { hasError: false };
  await step.beforeLeave(stepValidation);

  stepErrors.value[stepIndex] = stepValidation.hasError;
  return !stepValidation.hasError;
}

async function nextStep() {
  if (currentStepRef.value >= props.steps.length - 1)
    return;

  const currentStep = props.steps[currentStepRef.value];
  if (currentStep?.canProceed && !currentStep.canProceed())
    return;

  const isValid = await validateStep(currentStepRef.value);
  if (!isValid)
    return;

  currentStepRef.value++;
}

async function prevStep() {
  if (currentStepRef.value > 0) {
    currentStepRef.value--;
  }
}

function goToStep(index: number) {
  if (index >= 0 && index < props.steps.length) {
    currentStepRef.value = index;
  }
}

defineExpose({
  nextStep,
  prevStep,
  goToStep,
  validateStep,
});
</script>

<template>
  <div class="cs-stepper">
    <!-- Mobile Header -->
    <div class="mobile-header">
      <div class="step-indicator">
        {{ currentStepRef + 1 }}/{{ steps.length }}
      </div>
      <div class="step-label">
        {{ steps[currentStepRef]?.label }}
      </div>
    </div>

    <!-- Desktop Stepper Navigation -->
    <div class="desktop-nav">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="step-item"
        :class="{ active: index === currentStepRef, completed: index < currentStepRef }"
        @click="!linear && goToStep(index)"
      >
        <div class="step-circle">
          <span v-if="index < currentStepRef" class="check-icon">✓</span>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div class="step-text">
          {{ step.label }}
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="content-wrapper">
      <slot :name="`step-content-${currentStepRef}`" />
    </div>

    <!-- Controls -->
    <div class="controls">
      <VaButton
        v-if="currentStepRef > 0"
        class="btn btn-secondary"
        preset="primary"
        @click="prevStep()"
      >
        {{ $t("pages.booking.steps.back") }}
      </VaButton>
      <div class="spacer" />
      <VaButton
        v-if="currentStepRef < steps.length - 1"
        class="btn"
        :disabled="isNextDisabled"
        @click="nextStep()"
      >
        {{ $t("pages.booking.steps.next") }}
      </VaButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.controls {
  grid-area: controls;
}

.content-wrapper {
  grid-area: content;
}

.mobile-header {
  grid-area: header;
}

.desktop-nav {
  grid-area: nav;
}
.cs-stepper {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas:
    "header"
    "nav"
    "content"
    "controls";

  @media (min-width: 576px) {
    grid-template-columns: 1fr 2fr;
    grid-template-areas:
      "nav content"
      "nav controls";
  }
  gap: 2rem;
}

/* Mobile Header */
.mobile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding-inline: 1.5rem;
  padding-block-start: 1rem;
  border-bottom: 2px solid var(--va-primary);
  text-align: center;

  @media (min-width: 576px) {
    display: none;
  }
}

.step-indicator {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--va-textPrimary);
  opacity: 0.7;
}

.step-label {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--va-primary);
}

/* Desktop Navigation */
.desktop-nav {
  display: none;
  flex-direction: column;
  gap: 0;

  @media (min-width: 576px) {
    display: flex;
  }
}

.step-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;

  &.active {
    border-bottom-color: var(--va-primary);

    .step-circle {
      color: var(--va-primary);
      border: 2px solid var(--va-primary);
    }

    .step-text {
      color: var(--va-primary);
      font-weight: 600;
    }
  }

  &.completed {
    opacity: 0.7;

    .step-circle {
      background-color: var(--va-primary);
      color: white;
      border: none;
    }
  }

  &:hover:not(.active) {
    opacity: 0.8;
  }
}

.step-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: transparent;
  border: 2px solid var(--va-background-border);
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  flex-shrink: 0;
  color: var(--va-textPrimary);
}

.check-icon {
  font-size: 1.125rem;
}

.step-text {
  flex: 1;
  font-weight: 500;
  color: var(--va-textPrimary);
}

/* Content Area */
.content-wrapper {
  padding-inline: 2rem;
  @media (min-width: 576px) {
    padding: 2rem;
  }
}

/* Controls */
.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;

  @media (min-width: 576px) {
    padding: 1rem 2rem;
  }
}

.spacer {
  flex: 1;
}

.btn {
  inline-size: auto;
  min-width: 120px;
}

.btn-secondary {
  color: var(--va-primary);
  border: 1px solid var(--va-primary);
}

/* Ensure form compatibility */
:deep(.va-form) {
  width: 100%;
}
</style>
