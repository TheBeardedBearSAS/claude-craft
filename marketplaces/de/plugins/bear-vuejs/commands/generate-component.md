---
description: Generate a Vue.js component with TypeScript, tests, and Storybook
argument-hint: <ComponentName> [--module=<module>] [--base]
---

# Generate Vue.js Component

You are an expert Vue.js developer. Generate a complete component with all related files.

## ARGUMENTS

$ARGUMENTS

- `ComponentName`: Name of the component (PascalCase)
- `--module=<module>`: Target module (optional, defaults to components/)
- `--base`: Generate as a base component with Base prefix

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze impacted code, propose an implementation plan, and wait for your validation before making any changes.

## MISSION

Generate a complete Vue.js component following project standards:

1. Component file (.vue)
2. Test file (.test.ts)
3. Types file (.types.ts) if needed
4. Storybook story (.stories.ts) if Storybook is configured

## COMPONENT TEMPLATE

```vue
<!-- ComponentName.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ComponentNameProps } from './ComponentName.types'

// Props
const props = withDefaults(defineProps<ComponentNameProps>(), {
  // default values
})

// Emits
const emit = defineEmits<{
  'update': [value: string]
  'submit': []
}>()

// State
const isLoading = ref(false)

// Computed
const computedValue = computed(() => {
  // ...
})

// Methods
function handleAction() {
  emit('update', 'value')
}
</script>

<template>
  <div class="component-name" data-testid="component-name">
    <slot />
  </div>
</template>

<style scoped>
.component-name {
  /* styles */
}
</style>
```

## TEST TEMPLATE

```typescript
// ComponentName.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ComponentName from './ComponentName.vue'

describe('ComponentName', () => {
  const defaultProps = {
    // default test props
  }

  it('renders correctly', () => {
    const wrapper = mount(ComponentName, {
      props: defaultProps,
    })

    expect(wrapper.find('[data-testid="component-name"]').exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = mount(ComponentName, {
      props: defaultProps,
      slots: {
        default: '<span>Slot content</span>',
      },
    })

    expect(wrapper.text()).toContain('Slot content')
  })

  it('emits update event', async () => {
    const wrapper = mount(ComponentName, {
      props: defaultProps,
    })

    // Trigger action
    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('update')).toBeTruthy()
  })
})
```

## TYPES TEMPLATE

```typescript
// ComponentName.types.ts
export interface ComponentNameProps {
  /**
   * Primary prop description
   */
  primaryProp: string

  /**
   * Optional prop with default
   * @default 'default'
   */
  optionalProp?: string

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean
}

export interface ComponentNameEmits {
  (e: 'update', value: string): void
  (e: 'submit'): void
}
```

## STORYBOOK TEMPLATE

```typescript
// ComponentName.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3'
import ComponentName from './ComponentName.vue'

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
  argTypes: {
    primaryProp: {
      control: 'text',
      description: 'Primary prop description',
    },
    disabled: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof ComponentName>

export const Default: Story = {
  args: {
    primaryProp: 'Default value',
  },
}

export const Disabled: Story = {
  args: {
    primaryProp: 'Disabled state',
    disabled: true,
  },
}

export const WithSlot: Story = {
  args: {
    primaryProp: 'With slot',
  },
  render: (args) => ({
    components: { ComponentName },
    setup() {
      return { args }
    },
    template: `
      <ComponentName v-bind="args">
        <span>Custom slot content</span>
      </ComponentName>
    `,
  }),
}
```

## OUTPUT STRUCTURE

```
src/
└── components/              # or modules/<module>/components/
    └── ComponentName/
        ├── ComponentName.vue
        ├── ComponentName.test.ts
        ├── ComponentName.types.ts
        ├── ComponentName.stories.ts (if Storybook)
        └── index.ts
```

## INDEX FILE

```typescript
// index.ts
export { default as ComponentName } from './ComponentName.vue'
export type { ComponentNameProps } from './ComponentName.types'
```

## PROCESS

1. Parse component name and options
2. Determine target directory
3. Generate component file
4. Generate test file
5. Generate types file
6. Generate Storybook story (if configured)
7. Generate index.ts export
8. Report created files
