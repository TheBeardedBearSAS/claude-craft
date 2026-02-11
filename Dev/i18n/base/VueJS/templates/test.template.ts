import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ComponentName from './ComponentName.vue'

// ============================================================================
// SETUP
// ============================================================================

describe('ComponentName', () => {
  let wrapper: VueWrapper

  // Default props for all tests
  const defaultProps = {
    label: 'Test Label',
    disabled: false,
    loading: false,
  }

  // Setup before each test
  beforeEach(() => {
    // Initialize Pinia for tests
    setActivePinia(createPinia())

    // Clear all mocks
    vi.clearAllMocks()
  })

  // Cleanup after each test
  afterEach(() => {
    wrapper?.unmount()
  })

  // Helper to mount component
  function mountComponent(props = {}, options = {}) {
    return mount(ComponentName, {
      props: { ...defaultProps, ...props },
      ...options,
    })
  }

  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      wrapper = mountComponent()

      expect(wrapper.find('[data-testid="component"]').exists()).toBe(true)
    })

    it('displays the label prop', () => {
      wrapper = mountComponent({ label: 'Custom Label' })

      expect(wrapper.text()).toContain('Custom Label')
    })

    it('applies disabled class when disabled', () => {
      wrapper = mountComponent({ disabled: true })

      expect(wrapper.classes()).toContain('component--disabled')
    })

    it('shows loading indicator when loading', () => {
      wrapper = mountComponent({ loading: true })

      expect(wrapper.find('.component__loader').exists()).toBe(true)
    })
  })

  // ============================================================================
  // SLOT TESTS
  // ============================================================================

  describe('Slots', () => {
    it('renders default slot content', () => {
      wrapper = mountComponent({}, {
        slots: {
          default: '<span data-testid="slot-content">Slot Content</span>',
        },
      })

      expect(wrapper.find('[data-testid="slot-content"]').exists()).toBe(true)
    })

    it('renders named slots', () => {
      wrapper = mountComponent({}, {
        slots: {
          header: '<h2>Header</h2>',
          footer: '<button>Action</button>',
        },
      })

      expect(wrapper.find('h2').text()).toBe('Header')
      expect(wrapper.find('button').text()).toBe('Action')
    })
  })

  // ============================================================================
  // EVENT TESTS
  // ============================================================================

  describe('Events', () => {
    it('emits click event when clicked', async () => {
      wrapper = mountComponent()

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('does not emit click when disabled', async () => {
      wrapper = mountComponent({ disabled: true })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('emits update:modelValue with correct payload', async () => {
      wrapper = mountComponent()

      await wrapper.find('input').setValue('new value')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['new value'])
    })
  })

  // ============================================================================
  // COMPUTED PROPERTY TESTS
  // ============================================================================

  describe('Computed Properties', () => {
    it('computes isDisabled correctly', () => {
      wrapper = mountComponent({ disabled: false, loading: true })

      // Access component instance
      expect(wrapper.vm.isDisabled).toBe(true)
    })

    it('applies correct CSS classes', () => {
      wrapper = mountComponent({ disabled: true, loading: false })

      expect(wrapper.classes()).toContain('component--disabled')
      expect(wrapper.classes()).not.toContain('component--loading')
    })
  })

  // ============================================================================
  // ASYNC TESTS
  // ============================================================================

  describe('Async Operations', () => {
    it('handles async data loading', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ data: 'test' })
      vi.stubGlobal('fetch', mockFetch)

      wrapper = mountComponent()

      // Trigger async operation
      await wrapper.vm.fetchData()
      await flushPromises()

      expect(mockFetch).toHaveBeenCalled()
      expect(wrapper.vm.data).toBe('test')
    })

    it('handles async errors', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
      vi.stubGlobal('fetch', mockFetch)

      wrapper = mountComponent()

      await expect(wrapper.vm.fetchData()).rejects.toThrow('Network error')
      expect(wrapper.vm.error).toBe('Network error')
    })
  })

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge Cases', () => {
    it('handles empty label', () => {
      wrapper = mountComponent({ label: '' })

      expect(wrapper.find('.component__content').text()).toBe('')
    })

    it('handles undefined props gracefully', () => {
      wrapper = mount(ComponentName, {
        props: { label: 'Test' },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('handles rapid clicks', async () => {
      wrapper = mountComponent()

      // Rapid fire clicks
      await wrapper.trigger('click')
      await wrapper.trigger('click')
      await wrapper.trigger('click')

      // Should debounce or handle all
      expect(wrapper.emitted('click')?.length).toBeGreaterThanOrEqual(1)
    })
  })

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      wrapper = mountComponent({ disabled: true })

      expect(wrapper.attributes('aria-disabled')).toBe('true')
    })

    it('is keyboard accessible', async () => {
      wrapper = mountComponent()

      await wrapper.trigger('keydown.enter')

      expect(wrapper.emitted('click')).toBeTruthy()
    })
  })
})
