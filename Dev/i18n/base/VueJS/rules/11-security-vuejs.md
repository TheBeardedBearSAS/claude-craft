# Vue.js Security Guidelines

## OWASP Top 10 Protection

### A03:2021 - Injection (XSS Prevention)

#### Vue's Built-in Protection

Vue automatically escapes content in templates:

```vue
<template>
  <!-- ✅ SAFE: Auto-escaped by Vue -->
  <p>{{ userInput }}</p>
  <span :title="userInput">Hover me</span>

  <!-- ❌ DANGEROUS: Raw HTML rendering -->
  <div v-html="userInput"></div>
</template>
```

#### Safe v-html Usage

```vue
<script setup lang="ts">
import DOMPurify from 'dompurify'
import { computed } from 'vue'

const props = defineProps<{
  htmlContent: string
}>()

// ✅ Sanitize before rendering
const sanitizedHtml = computed(() =>
  DOMPurify.sanitize(props.htmlContent, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
  })
)
</script>

<template>
  <div v-html="sanitizedHtml"></div>
</template>
```

#### URL Sanitization

```typescript
// utils/security.ts
export function sanitizeUrl(url: string): string {
  const allowedProtocols = ['http:', 'https:', 'mailto:']

  try {
    const parsed = new URL(url)
    if (allowedProtocols.includes(parsed.protocol)) {
      return url
    }
  } catch {
    // Invalid URL
  }

  return '#'
}
```

```vue
<template>
  <!-- ✅ Safe URL binding -->
  <a :href="sanitizeUrl(userProvidedUrl)">Link</a>

  <!-- ❌ Never do this -->
  <a :href="userProvidedUrl">Link</a>
</template>
```

### A02:2021 - Cryptographic Failures

#### Secure Storage

```typescript
// ❌ NEVER store sensitive data in localStorage
localStorage.setItem('authToken', token)

// ✅ Use httpOnly cookies (set by backend)
// or memory-only storage for session

// composables/useAuth.ts
const authToken = ref<string | null>(null) // Memory only

export function useAuth() {
  return {
    authToken: readonly(authToken),
    setToken: (token: string) => {
      authToken.value = token
    },
    clearToken: () => {
      authToken.value = null
    },
  }
}
```

#### Environment Variables

```typescript
// ✅ VITE_ prefix exposes to client - use carefully
const apiUrl = import.meta.env.VITE_API_URL // OK for public API URL

// ❌ NEVER expose secrets
const apiKey = import.meta.env.VITE_API_KEY // DON'T DO THIS
```

### A05:2021 - Security Misconfiguration

#### Content Security Policy (CSP)

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.example.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
">
```

#### Security Headers (Vite Dev Server)

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
})
```

### A07:2021 - Cross-Site Request Forgery (CSRF)

#### CSRF Token Handling

```typescript
// services/api/client.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Send cookies
})

// Add CSRF token to requests
apiClient.interceptors.request.use((config) => {
  const csrfToken = getCsrfToken() // From cookie or meta tag
  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = csrfToken
  }
  return config
})

function getCsrfToken(): string | null {
  // From cookie
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export default apiClient
```

#### SameSite Cookie Configuration

```typescript
// Backend should set cookies with:
// Set-Cookie: session=abc123; SameSite=Strict; Secure; HttpOnly
```

## Authentication Best Practices

### JWT Handling

```typescript
// composables/useAuth.ts
import { ref, readonly } from 'vue'
import { jwtDecode } from 'jwt-decode'
import type { JwtPayload } from 'jwt-decode'

interface AuthUser {
  id: string
  email: string
  role: string
}

const user = ref<AuthUser | null>(null)
const accessToken = ref<string | null>(null)

export function useAuth() {
  function setToken(token: string) {
    try {
      const decoded = jwtDecode<JwtPayload & AuthUser>(token)

      // Check expiration
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        throw new Error('Token expired')
      }

      accessToken.value = token
      user.value = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      }
    } catch (error) {
      clearAuth()
      throw error
    }
  }

  function clearAuth() {
    accessToken.value = null
    user.value = null
  }

  function isTokenExpired(): boolean {
    if (!accessToken.value) return true

    try {
      const decoded = jwtDecode<JwtPayload>(accessToken.value)
      return decoded.exp ? decoded.exp * 1000 < Date.now() : true
    } catch {
      return true
    }
  }

  return {
    user: readonly(user),
    accessToken: readonly(accessToken),
    setToken,
    clearAuth,
    isTokenExpired,
  }
}
```

### Route Guards

```typescript
// router/guards/auth.guard.ts
import type { NavigationGuardWithThis } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

export const authGuard: NavigationGuardWithThis<undefined> = (to, _from, next) => {
  const { user, isTokenExpired } = useAuth()

  // Public routes
  if (to.meta.public) {
    return next()
  }

  // Check authentication
  if (!user.value || isTokenExpired()) {
    return next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
  }

  // Check authorization
  const requiredRole = to.meta.role as string | undefined
  if (requiredRole && user.value.role !== requiredRole) {
    return next({ name: 'forbidden' })
  }

  next()
}
```

```typescript
// router/index.ts
const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    beforeEnter: authGuard,
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { role: 'admin' },
    beforeEnter: authGuard,
  },
]
```

## Input Validation

### Form Validation with Zod

```typescript
// schemas/user.schema.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
})

export const registerSchema = loginSchema.extend({
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
```

### Composable for Validation

```typescript
// composables/useFormValidation.ts
import { ref, computed } from 'vue'
import type { ZodSchema, ZodError } from 'zod'

export function useFormValidation<T extends Record<string, any>>(
  schema: ZodSchema<T>,
  initialValues: T
) {
  const values = ref<T>({ ...initialValues })
  const errors = ref<Partial<Record<keyof T, string>>>({})
  const touched = ref<Partial<Record<keyof T, boolean>>>({})

  const isValid = computed(() => {
    const result = schema.safeParse(values.value)
    return result.success
  })

  function validate(): boolean {
    try {
      schema.parse(values.value)
      errors.value = {}
      return true
    } catch (e) {
      const zodError = e as ZodError
      errors.value = zodError.errors.reduce((acc, err) => {
        const path = err.path[0] as keyof T
        acc[path] = err.message
        return acc
      }, {} as Partial<Record<keyof T, string>>)
      return false
    }
  }

  function validateField(field: keyof T): void {
    touched.value[field] = true
    const result = schema.safeParse(values.value)
    if (!result.success) {
      const fieldError = result.error.errors.find(
        (e) => e.path[0] === field
      )
      errors.value[field] = fieldError?.message
    } else {
      delete errors.value[field]
    }
  }

  function reset(): void {
    values.value = { ...initialValues }
    errors.value = {}
    touched.value = {}
  }

  return {
    values,
    errors,
    touched,
    isValid,
    validate,
    validateField,
    reset,
  }
}
```

## Dependency Security

### Audit Commands

```bash
# Check for vulnerabilities
pnpm audit

# Update vulnerable packages
pnpm audit --fix

# Check outdated packages
pnpm outdated
```

### Lockfile Integrity

```bash
# Ensure lockfile is up to date
pnpm install --frozen-lockfile

# In CI/CD
pnpm install --frozen-lockfile --ignore-scripts
```

## Security Checklist

### Development

- [ ] No v-html with unsanitized user input
- [ ] All user URLs sanitized
- [ ] No sensitive data in VITE_ env vars
- [ ] CSRF tokens implemented
- [ ] Input validation on all forms
- [ ] Authentication guards on protected routes
- [ ] Authorization checks for roles/permissions

### Build & Deploy

- [ ] Dependencies audited for vulnerabilities
- [ ] CSP headers configured
- [ ] Security headers set (X-Frame-Options, etc.)
- [ ] HTTPS enforced
- [ ] Source maps disabled in production
- [ ] API keys not exposed in client bundle

### Runtime

- [ ] JWT tokens validated and expiration checked
- [ ] Refresh token rotation implemented
- [ ] Session timeout handling
- [ ] Secure cookie settings (HttpOnly, Secure, SameSite)
- [ ] Rate limiting on sensitive endpoints
