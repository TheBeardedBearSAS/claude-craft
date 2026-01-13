# Vue.js Architecture Guidelines

## Architecture Pattern

**Pattern**: Modular Architecture with Composition API

Vue.js applications should follow a modular, feature-based architecture that scales from small to large applications.

## Project Structure

```
src/
├── assets/                    # Static assets (images, fonts, global CSS)
│   ├── images/
│   ├── fonts/
│   └── styles/
│       ├── main.css
│       └── variables.css
│
├── components/                # Shared/Base components
│   ├── base/                  # Generic reusable components
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   ├── BaseModal.vue
│   │   └── BaseCard.vue
│   ├── layout/                # Layout components
│   │   ├── AppHeader.vue
│   │   ├── AppFooter.vue
│   │   ├── AppSidebar.vue
│   │   └── AppNavigation.vue
│   └── ui/                    # UI-specific components
│       ├── LoadingSpinner.vue
│       ├── ErrorMessage.vue
│       └── EmptyState.vue
│
├── composables/               # Reusable composition functions
│   ├── useAuth.ts
│   ├── useFetch.ts
│   ├── useForm.ts
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
│
├── modules/                   # Feature modules (domain-driven)
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.vue
│   │   │   └── RegisterForm.vue
│   │   ├── composables/
│   │   │   └── useAuth.ts
│   │   ├── stores/
│   │   │   └── auth.store.ts
│   │   ├── views/
│   │   │   ├── LoginView.vue
│   │   │   └── RegisterView.vue
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── index.ts
│   │
│   └── products/
│       ├── components/
│       ├── composables/
│       ├── stores/
│       ├── views/
│       ├── types/
│       └── index.ts
│
├── router/                    # Vue Router configuration
│   ├── index.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   └── routes/
│       ├── auth.routes.ts
│       └── products.routes.ts
│
├── stores/                    # Global Pinia stores
│   ├── index.ts
│   ├── app.store.ts
│   └── user.store.ts
│
├── services/                  # API and external services
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.api.ts
│   │   └── products.api.ts
│   └── external/
│       └── analytics.ts
│
├── types/                     # Global TypeScript types
│   ├── index.ts
│   ├── api.types.ts
│   └── common.types.ts
│
├── utils/                     # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── helpers.ts
│
├── plugins/                   # Vue plugins
│   └── i18n.ts
│
├── App.vue                    # Root component
└── main.ts                    # Application entry point
```

## Component Architecture

### Component Types

| Type | Location | Purpose |
|------|----------|---------|
| **Base Components** | `components/base/` | Generic, highly reusable (BaseButton, BaseInput) |
| **Layout Components** | `components/layout/` | App shell structure |
| **Feature Components** | `modules/{feature}/components/` | Feature-specific components |
| **View Components** | `modules/{feature}/views/` | Route-level components |

### Component Naming Convention

```
# Base components - Prefix with "Base"
BaseButton.vue
BaseInput.vue
BaseCard.vue

# Layout components - Prefix with "App" or "The"
AppHeader.vue
TheNavigation.vue

# Feature components - Descriptive, multi-word
ProductCard.vue
UserProfileForm.vue
OrderSummaryList.vue
```

## Composition API Patterns

### Script Setup (Recommended)

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/modules/products/stores/product.store'
import type { Product } from '@/modules/products/types'

// Props with TypeScript
interface Props {
  productId: string
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDetails: false
})

// Emits with TypeScript
const emit = defineEmits<{
  select: [product: Product]
  delete: [id: string]
}>()

// Store
const productStore = useProductStore()

// Reactive state
const isLoading = ref(false)
const error = ref<string | null>(null)

// Computed
const product = computed(() =>
  productStore.getProductById(props.productId)
)

// Methods
const handleSelect = () => {
  if (product.value) {
    emit('select', product.value)
  }
}

// Lifecycle
onMounted(async () => {
  isLoading.value = true
  try {
    await productStore.fetchProduct(props.productId)
  } catch (e) {
    error.value = 'Failed to load product'
  } finally {
    isLoading.value = false
  }
})
</script>
```

### Composables Pattern

```typescript
// composables/useFetch.ts
import { ref, type Ref } from 'vue'

interface UseFetchReturn<T> {
  data: Ref<T | null>
  error: Ref<string | null>
  isLoading: Ref<boolean>
  execute: () => Promise<void>
}

export function useFetch<T>(url: string): UseFetchReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  const execute = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Network error')
      data.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      isLoading.value = false
    }
  }

  return { data, error, isLoading, execute }
}
```

## Pinia Store Architecture

### Store Structure

```typescript
// stores/products.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product } from '@/types'
import { productsApi } from '@/services/api/products.api'

export const useProductsStore = defineStore('products', () => {
  // State
  const products = ref<Product[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedId = ref<string | null>(null)

  // Getters
  const selectedProduct = computed(() =>
    products.value.find(p => p.id === selectedId.value)
  )

  const productCount = computed(() => products.value.length)

  const sortedProducts = computed(() =>
    [...products.value].sort((a, b) => a.name.localeCompare(b.name))
  )

  // Actions
  async function fetchProducts() {
    isLoading.value = true
    error.value = null

    try {
      products.value = await productsApi.getAll()
    } catch (e) {
      error.value = 'Failed to fetch products'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function createProduct(product: Omit<Product, 'id'>) {
    const newProduct = await productsApi.create(product)
    products.value.push(newProduct)
    return newProduct
  }

  function selectProduct(id: string) {
    selectedId.value = id
  }

  // Reset
  function $reset() {
    products.value = []
    isLoading.value = false
    error.value = null
    selectedId.value = null
  }

  return {
    // State
    products,
    isLoading,
    error,
    selectedId,
    // Getters
    selectedProduct,
    productCount,
    sortedProducts,
    // Actions
    fetchProducts,
    createProduct,
    selectProduct,
    $reset,
  }
})
```

## Vue Router Architecture

### Route Organization

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { authRoutes } from './routes/auth.routes'
import { productRoutes } from './routes/products.routes'
import { authGuard } from './guards/auth.guard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/DefaultLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
        },
        ...productRoutes,
      ],
      beforeEnter: authGuard,
    },
    ...authRoutes,
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

export default router
```

## Key Architecture Principles

### 1. Single Responsibility
- Each component does one thing well
- Composables handle one concern
- Stores manage one domain

### 2. Separation of Concerns
- Business logic in composables/stores
- UI logic in components
- API calls in services

### 3. Feature Encapsulation
- Features are self-contained modules
- Minimal cross-module dependencies
- Clear public API via index.ts

### 4. Type Safety
- TypeScript throughout
- Strict mode enabled
- Props and emits typed

### 5. Lazy Loading
- Route-level code splitting
- Dynamic imports for heavy components
- Async components where appropriate
