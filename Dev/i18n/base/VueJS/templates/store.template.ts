import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ============================================================================
// TYPES
// ============================================================================

export interface ExampleItem {
  id: string
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateExampleDTO {
  name: string
  description: string
}

export interface UpdateExampleDTO {
  name?: string
  description?: string
}

// ============================================================================
// STORE
// ============================================================================

export const useExampleStore = defineStore('example', () => {
  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------

  const items = ref<ExampleItem[]>([])
  const selectedId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // -------------------------------------------------------------------------
  // GETTERS (Computed)
  // -------------------------------------------------------------------------

  /**
   * Currently selected item
   */
  const selectedItem = computed(() =>
    items.value.find((item) => item.id === selectedId.value) ?? null
  )

  /**
   * Total count of items
   */
  const itemCount = computed(() => items.value.length)

  /**
   * Items sorted by name
   */
  const sortedItems = computed(() =>
    [...items.value].sort((a, b) => a.name.localeCompare(b.name))
  )

  /**
   * Check if store has items
   */
  const hasItems = computed(() => items.value.length > 0)

  /**
   * Get item by ID
   */
  const getItemById = computed(() => (id: string) =>
    items.value.find((item) => item.id === id)
  )

  // -------------------------------------------------------------------------
  // ACTIONS
  // -------------------------------------------------------------------------

  /**
   * Fetch all items from API
   */
  async function fetchItems(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call
      // const response = await api.getItems()
      // items.value = response

      // Simulated response
      await new Promise((resolve) => setTimeout(resolve, 500))
      items.value = [
        {
          id: '1',
          name: 'Item 1',
          description: 'Description 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch items'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch single item by ID
   */
  async function fetchItem(id: string): Promise<ExampleItem> {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call
      // const item = await api.getItem(id)

      await new Promise((resolve) => setTimeout(resolve, 300))
      const item: ExampleItem = {
        id,
        name: `Item ${id}`,
        description: 'Fetched item',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Update or add to local state
      const index = items.value.findIndex((i) => i.id === id)
      if (index >= 0) {
        items.value[index] = item
      } else {
        items.value.push(item)
      }

      return item
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch item'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create new item
   */
  async function createItem(data: CreateExampleDTO): Promise<ExampleItem> {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call
      // const newItem = await api.createItem(data)

      const newItem: ExampleItem = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      items.value.push(newItem)
      return newItem
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create item'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update existing item
   */
  async function updateItem(
    id: string,
    data: UpdateExampleDTO
  ): Promise<ExampleItem> {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call
      // const updatedItem = await api.updateItem(id, data)

      const index = items.value.findIndex((i) => i.id === id)
      if (index === -1) {
        throw new Error('Item not found')
      }

      const updatedItem: ExampleItem = {
        ...items.value[index],
        ...data,
        updatedAt: new Date(),
      }

      items.value[index] = updatedItem
      return updatedItem
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update item'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete item
   */
  async function deleteItem(id: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call
      // await api.deleteItem(id)

      const index = items.value.findIndex((i) => i.id === id)
      if (index >= 0) {
        items.value.splice(index, 1)
      }

      // Clear selection if deleted item was selected
      if (selectedId.value === id) {
        selectedId.value = null
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete item'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Select an item
   */
  function selectItem(id: string | null): void {
    selectedId.value = id
  }

  /**
   * Reset store to initial state
   */
  function $reset(): void {
    items.value = []
    selectedId.value = null
    isLoading.value = false
    error.value = null
  }

  // -------------------------------------------------------------------------
  // RETURN
  // -------------------------------------------------------------------------

  return {
    // State
    items,
    selectedId,
    isLoading,
    error,

    // Getters
    selectedItem,
    itemCount,
    sortedItems,
    hasItems,
    getItemById,

    // Actions
    fetchItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem,
    selectItem,
    $reset,
  }
})
