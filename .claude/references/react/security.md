# React Security

## Fundamental Security Principles

### Defense in Depth

Apply multiple layers of security:
1. Validate on both client AND server side
2. Escape user data
3. Use HTTPS everywhere
4. Implement CSP (Content Security Policy)
5. Limit permissions
6. Log security events

## XSS (Cross-Site Scripting) Prevention

### React Protects by Default

```typescript
// ✅ SAFE - React automatically escapes content
const UserProfile: FC<{ name: string }> = ({ name }) => {
  return <div>{name}</div>;
  // If name = "<script>alert('xss')</script>"
  // React displays the raw text, not the script
};

// ✅ SAFE - React escapes attributes
const UserLink: FC<{ url: string }> = ({ url }) => {
  return <a href={url}>Link</a>;
  // React sanitizes malicious URLs
};
```

### Dangers with dangerouslySetInnerHTML

```typescript
// ❌ DANGEROUS - NEVER do this with user data
const UnsafeComponent: FC<{ html: string }> = ({ html }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
  // If html contains a malicious script, it will execute!
};

// ✅ SAFE - Sanitize HTML first
import DOMPurify from 'dompurify';

const SafeComponent: FC<{ html: string }> = ({ html }) => {
  const sanitizedHtml = DOMPurify.sanitize(html);

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
};
```

### DOMPurify Installation

```bash
npm install dompurify
npm install -D @types/dompurify
```

### DOMPurify Configuration

```typescript
// utils/sanitize.ts
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML to prevent XSS attacks
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    // Allow only certain tags
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],

    // Allow only certain attributes
    ALLOWED_ATTR: ['href', 'title'],

    // Force all links to target="_blank"
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i
  });
};

// Usage
const SafeRichText: FC<{ content: string }> = ({ content }) => {
  const sanitized = sanitizeHtml(content);

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};
```

### Sanitize User Input

```typescript
// ❌ BAD - Using user input directly
const SearchResults: FC = () => {
  const [query] = useSearchParams();
  const searchTerm = query.get('q');

  return <h1>Results for: {searchTerm}</h1>;
  // Vulnerable to XSS via URL manipulation
};

// ✅ GOOD - Validate and sanitize input
import { z } from 'zod';

const searchSchema = z.string().max(100).regex(/^[a-zA-Z0-9\s]+$/);

const SearchResults: FC = () => {
  const [query] = useSearchParams();
  const rawQuery = query.get('q') || '';

  // Validate with Zod
  const result = searchSchema.safeParse(rawQuery);

  if (!result.success) {
    return <div>Invalid search query</div>;
  }

  return <h1>Results for: {result.data}</h1>;
};
```

## CSRF (Cross-Site Request Forgery) Protection

### CSRF Token in Requests

```typescript
// services/api.service.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true // Send cookies
});

// Interceptor to add CSRF token
apiClient.interceptors.request.use((config) => {
  // Get CSRF token from cookies or meta tag
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = csrfToken;
  }

  return config;
});

export { apiClient };
```

### Double Submit Cookie Pattern

```typescript
// utils/csrf.ts
import Cookies from 'js-cookie';

/**
 * Generate and store a CSRF token
 */
export const generateCsrfToken = (): string => {
  const token = crypto.randomUUID();
  Cookies.set('XSRF-TOKEN', token, {
    secure: true,
    sameSite: 'strict'
  });
  return token;
};

/**
 * Get the CSRF token
 */
export const getCsrfToken = (): string | undefined => {
  return Cookies.get('XSRF-TOKEN');
};

// Usage in a form
const LoginForm: FC = () => {
  const handleSubmit = async (data: LoginData) => {
    const csrfToken = getCsrfToken();

    await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken || ''
      },
      body: JSON.stringify(data)
    });
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
};
```

## Authentication and Authorization

### Secure Token Storage

```typescript
// ❌ BAD - localStorage is vulnerable to XSS
localStorage.setItem('token', jwtToken);

// ❌ BAD - sessionStorage too
sessionStorage.setItem('token', jwtToken);

// ✅ GOOD - HttpOnly Cookie (managed by server)
// Server sets the cookie:
// Set-Cookie: auth_token=xxx; HttpOnly; Secure; SameSite=Strict

// ✅ ACCEPTABLE - If you must store client-side, encrypt
import CryptoJS from 'crypto-js';

const encryptToken = (token: string, secretKey: string): string => {
  return CryptoJS.AES.encrypt(token, secretKey).toString();
};

const decryptToken = (encryptedToken: string, secretKey: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Store encrypted token
const secretKey = import.meta.env.VITE_ENCRYPTION_KEY;
const encryptedToken = encryptToken(jwtToken, secretKey);
sessionStorage.setItem('auth', encryptedToken);
```

### Protected Routes

```typescript
// components/ProtectedRoute.tsx
import { FC, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string[];
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  requiredRole
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, keeping destination route
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check roles if specified
  if (requiredRole && user) {
    const hasRequiredRole = requiredRole.includes(user.role);

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// Usage in routing
const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/admin"
      element={
        <ProtectedRoute requiredRole={['admin']}>
          <AdminPage />
        </ProtectedRoute>
      }
    />
  </Routes>
);
```

### JWT Token Validation

```typescript
// utils/jwt.ts
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  sub: string;
  exp: number;
  iat: number;
  role: string;
}

/**
 * Check if a JWT is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000;

    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

/**
 * Get JWT data
 */
export const getTokenData = (token: string): JWTPayload | null => {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch {
    return null;
  }
};

// Usage
const useAuth = () => {
  const token = getAuthToken();

  if (!token || isTokenExpired(token)) {
    // Token expired, request refresh or logout
    refreshToken();
  }

  const tokenData = getTokenData(token);

  return {
    user: tokenData,
    isAuthenticated: !!tokenData
  };
};
```

## Input Validation and Sanitization

### Validation with Zod

```typescript
import { z } from 'zod';

// Secure validation schemas
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email too long')
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username too long')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
  .trim();

export const urlSchema = z
  .string()
  .url('Invalid URL')
  .refine(
    (url) => {
      // Allow only http and https
      return url.startsWith('https://') || url.startsWith('http://');
    },
    { message: 'URL must use HTTP or HTTPS protocol' }
  );

// Registration form schema
export const registerSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

// Usage in a component
const RegisterForm: FC = () => {
  const form = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    // data is validated and secure
    await registerUser(data);
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>;
};
```

### URL Sanitization

```typescript
// utils/url.ts

/**
 * Sanitize and validate a URL to prevent attacks
 */
export const sanitizeUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);

    // Allow only http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    // Block local IPs
    const hostname = parsed.hostname;
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.')
    ) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
};

// Usage
const ExternalLink: FC<{ href: string; children: ReactNode }> = ({
  href,
  children
}) => {
  const safeUrl = sanitizeUrl(href);

  if (!safeUrl) {
    return <span>{children}</span>;
  }

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer" // Important security!
    >
      {children}
    </a>
  );
};
```

## Content Security Policy (CSP)

### CSP Headers Configuration

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Avoid unsafe-* in prod
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://api.example.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ')
    }
  }
});
```

### CSP for Production (Nginx)

```nginx
# nginx.conf
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.example.com; frame-ancestors 'none';" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

## Dependency Security

### Regular Audits

```bash
# Audit vulnerabilities
npm audit

# Audit with automatic fixes
npm audit fix

# Audit with major fixes (caution!)
npm audit fix --force

# Use pnpm (better for security)
pnpm audit
```

### Dependabot Configuration

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 10
    reviewers:
      - 'your-username'
    commit-message:
      prefix: 'chore(deps)'
    labels:
      - 'dependencies'
      - 'security'
```

### Snyk Integration

```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# Scan vulnerabilities
snyk test

# Monitor project
snyk monitor
```

## Secrets Management

### Environment Variables

```typescript
// ❌ BAD - NEVER commit secrets
const API_KEY = 'sk-1234567890abcdef'; // DANGER!

// ✅ GOOD - Use environment variables
const API_KEY = import.meta.env.VITE_API_KEY;

// Validate presence of secrets at startup
if (!API_KEY) {
  throw new Error('VITE_API_KEY is required');
}
```

### .env.example

```env
# .env.example (commit this file)
VITE_API_BASE_URL=http://localhost:8000
VITE_API_KEY=your-api-key-here
VITE_AUTH_DOMAIN=auth.example.com
```

### .env (NEVER commit)

```env
# .env (add to .gitignore)
VITE_API_BASE_URL=https://api.production.com
VITE_API_KEY=sk-real-secret-key
VITE_AUTH_DOMAIN=auth.production.com
```

### .gitignore

```gitignore
# Secrets
.env
.env.local
.env.*.local
.env.production

# Do not ignore .env.example!
!.env.example
```

## Client-Side Rate Limiting

```typescript
// utils/rateLimit.ts
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: number[] = [];

  constructor(private config: RateLimitConfig) {}

  canMakeRequest(): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Clean old requests
    this.requests = this.requests.filter((time) => time > windowStart);

    // Check limit
    if (this.requests.length >= this.config.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  getRemainingTime(): number {
    if (this.requests.length === 0) return 0;

    const oldestRequest = Math.min(...this.requests);
    const windowEnd = oldestRequest + this.config.windowMs;
    const remaining = windowEnd - Date.now();

    return Math.max(0, remaining);
  }
}

// Usage
const loginRateLimiter = new RateLimiter({
  maxRequests: 5, // 5 attempts
  windowMs: 15 * 60 * 1000 // 15 minutes
});

const LoginForm: FC = () => {
  const handleSubmit = async (data: LoginData) => {
    if (!loginRateLimiter.canMakeRequest()) {
      const waitTime = Math.ceil(loginRateLimiter.getRemainingTime() / 1000);
      toast.error(`Too many attempts. Wait ${waitTime} seconds.`);
      return;
    }

    await login(data);
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
};
```

## Secure Logging and Monitoring

```typescript
// utils/secureLogger.ts

interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, unknown>;
}

class SecureLogger {
  private sensitiveFields = ['password', 'token', 'secret', 'apiKey'];

  /**
   * Remove sensitive fields before logging
   */
  private sanitize(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      if (this.sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = this.sanitize(value);
      }
    }

    return sanitized;
  }

  log(entry: Omit<LogEntry, 'timestamp'>): void {
    const sanitizedEntry = {
      ...entry,
      timestamp: new Date(),
      metadata: entry.metadata ? this.sanitize(entry.metadata) : undefined
    };

    // Send to logging service (Sentry, LogRocket, etc.)
    console.log(sanitizedEntry);
  }

  error(message: string, error: Error, metadata?: Record<string, unknown>): void {
    this.log({
      level: 'error',
      message,
      metadata: {
        ...metadata,
        errorMessage: error.message,
        errorStack: error.stack
      }
    });
  }
}

export const logger = new SecureLogger();

// Usage
const handleLogin = async (credentials: LoginCredentials) => {
  try {
    const result = await loginUser(credentials);

    logger.log({
      level: 'info',
      message: 'User logged in successfully',
      userId: result.user.id
      // password is NOT logged!
    });

    return result;
  } catch (error) {
    logger.error('Login failed', error as Error, {
      email: credentials.email
      // password is NOT logged!
    });

    throw error;
  }
};
```

## Security Checklist

### Before Each Release

- [ ] Audit dependencies (`npm audit`)
- [ ] No hardcoded secrets
- [ ] CSP headers configured
- [ ] HTTPS enabled everywhere
- [ ] Input validation on client AND server
- [ ] XSS protection (DOMPurify if HTML)
- [ ] CSRF protection enabled
- [ ] Rate limiting implemented
- [ ] Secure logs (no sensitive data)
- [ ] Protected routes configured
- [ ] Secure token storage
- [ ] URLs sanitized
- [ ] `rel="noopener noreferrer"` on external links

## Conclusion

Security in React requires:

1. ✅ **Validation**: Client AND server side
2. ✅ **Sanitization**: Clean all user data
3. ✅ **Protection**: XSS, CSRF, injection
4. ✅ **Authentication**: Secure tokens, protected routes
5. ✅ **Monitoring**: Secure logs, regular audits

**Golden rule**: NEVER trust user data. Always validate, sanitize and secure.
