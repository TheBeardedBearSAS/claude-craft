# Vue.js Coding Standards

## Vue 3 + TypeScript Configuration

### Required Setup

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ESNext", "DOM"],
    "skipLibCheck": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Component Standards

### Single File Component Structure

```vue
<!-- Order: script → template → style -->
<script setup lang="ts">
// 1. Imports
import { ref, computed, onMounted } from 'vue'
import type { User } from '@/types'

// 2. Props & Emits
interface Props {
  user: User
  showAvatar?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  showAvatar: true
})

const emit = defineEmits<{
  update: [user: User]
  delete: [id: string]
}>()

// 3. Composables
const { isAuthenticated } = useAuth()

// 4. Reactive State
const isEditing = ref(false)
const formData = ref({ ...props.user })

// 5. Computed Properties
const fullName = computed(() =>
  `${props.user.firstName} ${props.user.lastName}`
)

// 6. Methods
function handleSubmit() {
  emit('update', formData.value)
  isEditing.value = false
}

// 7. Lifecycle Hooks
onMounted(() => {
  // initialization
})

// 8. Watchers (if needed)
watch(() => props.user, (newUser) => {
  formData.value = { ...newUser }
})
</script>

<template>
  <div class="user-card">
    <img v-if="showAvatar" :src="user.avatar" :alt="fullName">
    <h2>{{ fullName }}</h2>
    <slot name="actions" />
  </div>
</template>

<style scoped>
.user-card {
  padding: 1rem;
  border-radius: 8px;
}
</style>
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase, multi-word | `UserProfileCard.vue` |
| Base Components | `Base` prefix | `BaseButton.vue` |
| Layout Components | `App` or `The` prefix | `AppHeader.vue` |
| Composables | `use` prefix, camelCase | `useAuth.ts` |
| Stores | `use{Name}Store` | `useUserStore` |
| Props | camelCase | `userName`, `isActive` |
| Events | kebab-case in template | `@update-user` |
| CSS Classes | BEM or kebab-case | `user-card__title` |

### Props Definition

```typescript
// ✅ TypeScript with defaults
interface Props {
  title: string
  count?: number
  items: string[]
  user?: User | null
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  user: null
})

// ✅ Validator (when needed)
const props = defineProps({
  status: {
    type: String as PropType<'pending' | 'success' | 'error'>,
    required: true,
    validator: (value: string) => ['pending', 'success', 'error'].includes(value)
  }
})
```

### Events Definition

```typescript
// ✅ Typed emits
const emit = defineEmits<{
  // Tuple syntax for typed payload
  'update': [value: string]
  'submit': [data: FormData]
  'delete': [id: number, confirm: boolean]
  // Void events
  'close': []
  'cancel': []
}>()

// ✅ Usage
emit('update', newValue)
emit('submit', formData)
emit('delete', itemId, true)
emit('close')
```

### v-model with defineModel (Vue 3.4+)

```vue
<script setup lang="ts">
// ✅ Simple v-model
const model = defineModel<string>()

// ✅ Named v-model
const firstName = defineModel<string>('firstName')
const lastName = defineModel<string>('lastName')

// ✅ With default value
const count = defineModel<number>({ default: 0 })

// ✅ With modifiers
const [model, modifiers] = defineModel<string, 'trim' | 'uppercase'>()
</script>
```

## Template Standards

### Directive Usage

```vue
<template>
  <!-- ✅ v-if/v-else-if/v-else chain -->
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else>{{ data }}</div>

  <!-- ✅ v-show for frequent toggles -->
  <Sidebar v-show="isSidebarOpen" />

  <!-- ✅ v-for with key -->
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>

  <!-- ✅ v-for with index (only when needed) -->
  <li v-for="(item, index) in items" :key="item.id">
    {{ index + 1 }}. {{ item.name }}
  </li>

  <!-- ❌ Avoid v-if with v-for -->
  <!-- <li v-for="item in items" v-if="item.isActive"> -->

  <!-- ✅ Use computed instead -->
  <li v-for="item in activeItems" :key="item.id">
    {{ item.name }}
  </li>
</template>
```

### Attribute Binding

```vue
<template>
  <!-- ✅ Dynamic attribute binding -->
  <input :value="modelValue" :disabled="isDisabled">

  <!-- ✅ Boolean attributes -->
  <button :disabled="isSubmitting">Submit</button>

  <!-- ✅ Class binding -->
  <div :class="{ active: isActive, disabled: isDisabled }">
  <div :class="[baseClass, { active: isActive }]">

  <!-- ✅ Style binding -->
  <div :style="{ color: textColor, fontSize: fontSize + 'px' }">

  <!-- ✅ v-bind for multiple attributes -->
  <input v-bind="inputAttrs">
</template>

<script setup lang="ts">
const inputAttrs = computed(() => ({
  type: 'text',
  placeholder: 'Enter value',
  disabled: isDisabled.value
}))
</script>
```

### Event Handling

```vue
<template>
  <!-- ✅ Method reference -->
  <button @click="handleClick">Click</button>

  <!-- ✅ Inline handler for simple cases -->
  <button @click="isOpen = true">Open</button>

  <!-- ✅ With arguments -->
  <button @click="handleDelete(item.id)">Delete</button>

  <!-- ✅ Event modifiers -->
  <form @submit.prevent="handleSubmit">
  <button @click.stop="handleClick">
  <input @keyup.enter="handleSubmit">

  <!-- ✅ Once modifier -->
  <button @click.once="initializeOnce">Initialize</button>
</template>
```

## Composables Standards

### Composable Structure

```typescript
// composables/useCounter.ts
import { ref, computed, readonly } from 'vue'

interface UseCounterOptions {
  min?: number
  max?: number
  step?: number
}

interface UseCounterReturn {
  count: Readonly<Ref<number>>
  doubled: ComputedRef<number>
  increment: () => void
  decrement: () => void
  reset: () => void
}

export function useCounter(
  initialValue = 0,
  options: UseCounterOptions = {}
): UseCounterReturn {
  const { min = -Infinity, max = Infinity, step = 1 } = options

  const count = ref(initialValue)

  const doubled = computed(() => count.value * 2)

  function increment() {
    const newValue = count.value + step
    if (newValue <= max) {
      count.value = newValue
    }
  }

  function decrement() {
    const newValue = count.value - step
    if (newValue >= min) {
      count.value = newValue
    }
  }

  function reset() {
    count.value = initialValue
  }

  return {
    count: readonly(count),
    doubled,
    increment,
    decrement,
    reset,
  }
}
```

### Async Composable Pattern

```typescript
// composables/useAsyncData.ts
import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'

interface UseAsyncDataReturn<T> {
  data: ShallowRef<T | null>
  error: Ref<Error | null>
  isLoading: Ref<boolean>
  execute: () => Promise<T>
  refresh: () => Promise<T>
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options: { immediate?: boolean } = {}
): UseAsyncDataReturn<T> {
  const { immediate = true } = options

  const data = shallowRef<T | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  async function execute(): Promise<T> {
    isLoading.value = true
    error.value = null

    try {
      const result = await fetcher()
      data.value = result
      return result
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  if (immediate) {
    execute()
  }

  return {
    data,
    error,
    isLoading,
    execute,
    refresh: execute,
  }
}
```

## TypeScript Integration

### Type Definitions

```typescript
// types/user.types.ts
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export type UserRole = 'admin' | 'user' | 'guest'

export interface CreateUserDTO {
  email: string
  firstName: string
  lastName: string
  password: string
}

export interface UpdateUserDTO {
  firstName?: string
  lastName?: string
}
```

### Component Type Utilities

```typescript
// Extracting component instance type
import type { ComponentPublicInstance } from 'vue'
import MyComponent from './MyComponent.vue'

type MyComponentInstance = InstanceType<typeof MyComponent>

// Template refs
const myComponentRef = ref<MyComponentInstance | null>(null)

// Expose for parent access
defineExpose({
  reset: () => { /* ... */ },
  validate: () => { /* ... */ }
})
```

## Import Organization

```typescript
// 1. Vue core
import { ref, computed, watch, onMounted } from 'vue'

// 2. Vue ecosystem (router, pinia)
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

// 3. Third-party libraries
import { format } from 'date-fns'
import { z } from 'zod'

// 4. Internal - stores
import { useUserStore } from '@/stores/user.store'

// 5. Internal - composables
import { useFetch } from '@/composables/useFetch'

// 6. Internal - components
import BaseButton from '@/components/base/BaseButton.vue'
import UserCard from './UserCard.vue'

// 7. Internal - types
import type { User, UserRole } from '@/types'
```

## Style Standards

### Scoped Styles (Default)

```vue
<style scoped>
.component {
  /* Scoped to this component */
}

/* Deep selector for child components */
.component :deep(.child-class) {
  color: red;
}

/* Slotted content */
.component :slotted(.slot-class) {
  font-weight: bold;
}

/* Global within scoped */
.component :global(.global-class) {
  /* Affects globally */
}
</style>
```

### CSS Variables

```vue
<script setup>
const theme = {
  primary: '#3498db',
  secondary: '#2ecc71'
}
</script>

<style scoped>
.button {
  background: v-bind('theme.primary');
  border-color: v-bind('theme.secondary');
}
</style>
```

## Vue 3.5 — Nouvelles APIs Composition

Vue 3.5 introduit plusieurs APIs qui simplifient les patterns courants et améliorent les performances.

### useTemplateRef

Remplace `ref(null)` pour les template refs. La ref est directement liée à l'attribut `ref` du template sans déclaration redondante.

```typescript
// ✅ Vue 3.5+ — useTemplateRef
import { useTemplateRef } from 'vue'
const inputEl = useTemplateRef('myInput')

// ❌ Avant Vue 3.5
const inputEl = ref<HTMLInputElement | null>(null)
```

```html
<input ref="myInput" />
```

### useId

Génère des IDs stables et uniques, SSR-safe. Indispensable pour lier `label` et `input` via `aria-labelledby` sans collision côté serveur.

```typescript
import { useId } from 'vue'
const fieldId = useId() // 'v-0', 'v-1', ...
```

```html
<label :for="fieldId">Nom</label>
<input :id="fieldId" type="text" />
```

### onWatcherCleanup

Déclare le cleanup directement à l'intérieur du watcher, au lieu de retourner une fonction ou d'utiliser `onScopeDispose`. Plus lisible et colocalisé avec la logique de l'effet.

```typescript
import { watch, onWatcherCleanup } from 'vue'

watch(source, (newVal) => {
  const timer = setTimeout(() => fetchData(newVal), 300)
  onWatcherCleanup(() => clearTimeout(timer))
})
```

### Performance du système réactif

Vue 3.5 réduit la consommation mémoire de **56 % vs 3.4** sur les tableaux larges grâce à la refonte du tracking de dépendances (version-counting reactivity). Les applications manipulant de grandes listes réactives bénéficient de cette amélioration sans changement de code.
