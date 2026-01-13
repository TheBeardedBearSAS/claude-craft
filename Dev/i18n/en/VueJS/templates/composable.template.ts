import { ref, computed, readonly, onUnmounted, type Ref, type ComputedRef } from 'vue'

// ============================================================================
// TYPES
// ============================================================================

export interface UseExampleOptions {
  /**
   * Initial value
   * @default ''
   */
  initialValue?: string

  /**
   * Enable debug mode
   * @default false
   */
  debug?: boolean
}

export interface UseExampleReturn {
  /**
   * Current value (readonly)
   */
  value: Readonly<Ref<string>>

  /**
   * Computed uppercase value
   */
  upperValue: ComputedRef<string>

  /**
   * Loading state
   */
  isLoading: Ref<boolean>

  /**
   * Error message
   */
  error: Ref<string | null>

  /**
   * Update the value
   */
  setValue: (newValue: string) => void

  /**
   * Reset to initial state
   */
  reset: () => void

  /**
   * Async operation example
   */
  fetchData: () => Promise<void>
}

// ============================================================================
// COMPOSABLE
// ============================================================================

/**
 * Example composable demonstrating best practices
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useExample } from '@/composables/useExample'
 *
 * const { value, upperValue, setValue, reset } = useExample({
 *   initialValue: 'Hello',
 * })
 * </script>
 * ```
 */
export function useExample(options: UseExampleOptions = {}): UseExampleReturn {
  const { initialValue = '', debug = false } = options

  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------

  const value = ref(initialValue)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // -------------------------------------------------------------------------
  // COMPUTED
  // -------------------------------------------------------------------------

  const upperValue = computed(() => value.value.toUpperCase())

  // -------------------------------------------------------------------------
  // METHODS
  // -------------------------------------------------------------------------

  function setValue(newValue: string): void {
    if (debug) {
      console.log('[useExample] setValue:', newValue)
    }
    value.value = newValue
    error.value = null
  }

  function reset(): void {
    if (debug) {
      console.log('[useExample] reset')
    }
    value.value = initialValue
    error.value = null
    isLoading.value = false
  }

  async function fetchData(): Promise<void> {
    if (debug) {
      console.log('[useExample] fetchData started')
    }

    isLoading.value = true
    error.value = null

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      value.value = 'Fetched data'
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // -------------------------------------------------------------------------
  // LIFECYCLE / CLEANUP
  // -------------------------------------------------------------------------

  // Example: cleanup on unmount
  onUnmounted(() => {
    if (debug) {
      console.log('[useExample] cleanup')
    }
    // Cancel any pending operations, remove event listeners, etc.
  })

  // -------------------------------------------------------------------------
  // RETURN
  // -------------------------------------------------------------------------

  return {
    // State (readonly to prevent external mutation)
    value: readonly(value),
    upperValue,
    isLoading,
    error,

    // Methods
    setValue,
    reset,
    fetchData,
  }
}
