<script setup lang="ts">
import { ref, computed } from 'vue'

// ============================================================================
// TYPES
// ============================================================================

interface Props {
  /**
   * Main content or label
   */
  label: string

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean

  /**
   * Loading state
   * @default false
   */
  loading?: boolean
}

// ============================================================================
// PROPS & EMITS
// ============================================================================

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  loading: false,
})

const emit = defineEmits<{
  /**
   * Emitted when the component is clicked
   */
  click: []

  /**
   * Emitted when value changes
   */
  'update:modelValue': [value: string]
}>()

// ============================================================================
// STATE
// ============================================================================

const isActive = ref(false)

// ============================================================================
// COMPUTED
// ============================================================================

const isDisabled = computed(() => props.disabled || props.loading)

const classes = computed(() => ({
  'component': true,
  'component--active': isActive.value,
  'component--disabled': isDisabled.value,
  'component--loading': props.loading,
}))

// ============================================================================
// METHODS
// ============================================================================

function handleClick() {
  if (isDisabled.value) return

  isActive.value = !isActive.value
  emit('click')
}
</script>

<template>
  <div
    :class="classes"
    data-testid="component"
    @click="handleClick"
  >
    <!-- Loading indicator -->
    <span v-if="loading" class="component__loader">
      Loading...
    </span>

    <!-- Main content -->
    <span v-else class="component__content">
      {{ label }}
    </span>

    <!-- Slot for additional content -->
    <slot />
  </div>
</template>

<style scoped>
.component {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.component--active {
  background-color: var(--color-primary);
  color: white;
}

.component--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.component--loading {
  cursor: wait;
}

.component__loader {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
