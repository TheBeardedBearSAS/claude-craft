# Seguridad React

## Principios Fundamentales de Seguridad

### Defensa en Profundidad

Aplicar múltiples capas de seguridad:
1. Validar en cliente Y servidor
2. Escapar datos de usuario
3. Usar HTTPS en todos lados
4. Implementar CSP (Content Security Policy)
5. Limitar permisos
6. Registrar eventos de seguridad

## Prevención de XSS (Cross-Site Scripting)

### React Protege por Defecto

```typescript
// ✅ SEGURO - React escapa automáticamente el contenido
const UserProfile: FC<{ name: string }> = ({ name }) => {
  return <div>{name}</div>;
  // Si name = "<script>alert('xss')</script>"
  // React muestra el texto sin procesar, no ejecuta el script
};

// ✅ SEGURO - React escapa atributos
const UserLink: FC<{ url: string }> = ({ url }) => {
  return <a href={url}>Link</a>;
  // React sanitiza URLs maliciosas
};
```

### Peligros con dangerouslySetInnerHTML

```typescript
// ❌ PELIGROSO - NUNCA hacer esto con datos de usuario
const UnsafeComponent: FC<{ html: string }> = ({ html }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
  // Si html contiene un script malicioso, ¡se ejecutará!
};

// ✅ SEGURO - Sanitizar HTML primero
import DOMPurify from 'dompurify';

const SafeComponent: FC<{ html: string }> = ({ html }) => {
  const sanitizedHtml = DOMPurify.sanitize(html);

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
};
```

### Instalación de DOMPurify

```bash
npm install dompurify
npm install -D @types/dompurify
```

### Configuración de DOMPurify

```typescript
// utils/sanitize.ts
import DOMPurify from 'dompurify';

/**
 * Sanitizar HTML para prevenir ataques XSS
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    // Permitir solo ciertas etiquetas
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],

    // Permitir solo ciertos atributos
    ALLOWED_ATTR: ['href', 'title'],

    // Forzar todos los links a target="_blank"
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i
  });
};

// Uso
const SafeRichText: FC<{ content: string }> = ({ content }) => {
  const sanitized = sanitizeHtml(content);

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};
```

### Sanitizar Entrada de Usuario

```typescript
// ❌ MALO - Usar entrada de usuario directamente
const SearchResults: FC = () => {
  const [query] = useSearchParams();
  const searchTerm = query.get('q');

  return <h1>Results for: {searchTerm}</h1>;
  // Vulnerable a XSS vía manipulación de URL
};

// ✅ BUENO - Validar y sanitizar entrada
import { z } from 'zod';

const searchSchema = z.string().max(100).regex(/^[a-zA-Z0-9\s]+$/);

const SearchResults: FC = () => {
  const [query] = useSearchParams();
  const rawQuery = query.get('q') || '';

  // Validar con Zod
  const result = searchSchema.safeParse(rawQuery);

  if (!result.success) {
    return <div>Invalid search query</div>;
  }

  return <h1>Results for: {result.data}</h1>;
};
```

## Protección CSRF (Cross-Site Request Forgery)

### Token CSRF en Peticiones

```typescript
// services/api.service.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true // Enviar cookies
});

// Interceptor para agregar token CSRF
apiClient.interceptors.request.use((config) => {
  // Obtener token CSRF de cookies o meta tag
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = csrfToken;
  }

  return config;
});

export { apiClient };
```

### Patrón Double Submit Cookie

```typescript
// utils/csrf.ts
import Cookies from 'js-cookie';

/**
 * Generar y almacenar un token CSRF
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
 * Obtener el token CSRF
 */
export const getCsrfToken = (): string | undefined => {
  return Cookies.get('XSRF-TOKEN');
};

// Uso en un formulario
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

## Autenticación y Autorización

### Almacenamiento Seguro de Tokens

```typescript
// ❌ MALO - localStorage es vulnerable a XSS
localStorage.setItem('token', jwtToken);

// ❌ MALO - sessionStorage también
sessionStorage.setItem('token', jwtToken);

// ✅ BUENO - HttpOnly Cookie (gestionada por servidor)
// El servidor establece la cookie:
// Set-Cookie: auth_token=xxx; HttpOnly; Secure; SameSite=Strict

// ✅ ACEPTABLE - Si debe almacenar del lado del cliente, encriptar
import CryptoJS from 'crypto-js';

const encryptToken = (token: string, secretKey: string): string => {
  return CryptoJS.AES.encrypt(token, secretKey).toString();
};

const decryptToken = (encryptedToken: string, secretKey: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Almacenar token encriptado
const secretKey = import.meta.env.VITE_ENCRYPTION_KEY;
const encryptedToken = encryptToken(jwtToken, secretKey);
sessionStorage.setItem('auth', encryptedToken);
```

### Rutas Protegidas

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
    // Redireccionar a login, manteniendo ruta de destino
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar roles si están especificados
  if (requiredRole && user) {
    const hasRequiredRole = requiredRole.includes(user.role);

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// Uso en enrutamiento
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

### Validación de Token JWT

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
 * Verificar si un JWT está expirado
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
 * Obtener datos del JWT
 */
export const getTokenData = (token: string): JWTPayload | null => {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch {
    return null;
  }
};

// Uso
const useAuth = () => {
  const token = getAuthToken();

  if (!token || isTokenExpired(token)) {
    // Token expirado, solicitar refresh o logout
    refreshToken();
  }

  const tokenData = getTokenData(token);

  return {
    user: tokenData,
    isAuthenticated: !!tokenData
  };
};
```

## Validación y Sanitización de Entrada

### Validación con Zod

```typescript
import { z } from 'zod';

// Esquemas de validación seguros
export const emailSchema = z
  .string()
  .email('Formato de email inválido')
  .max(255, 'Email demasiado largo')
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'Contraseña demasiado larga')
  .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial');

export const usernameSchema = z
  .string()
  .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
  .max(20, 'Nombre de usuario demasiado largo')
  .regex(/^[a-zA-Z0-9_]+$/, 'El nombre de usuario solo puede contener letras, números y guiones bajos')
  .trim();

export const urlSchema = z
  .string()
  .url('URL inválida')
  .refine(
    (url) => {
      // Permitir solo http y https
      return url.startsWith('https://') || url.startsWith('http://');
    },
    { message: 'La URL debe usar protocolo HTTP o HTTPS' }
  );

// Esquema de formulario de registro
export const registerSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
  });

// Uso en un componente
const RegisterForm: FC = () => {
  const form = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    // data está validado y es seguro
    await registerUser(data);
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>;
};
```

### Sanitización de URL

```typescript
// utils/url.ts

/**
 * Sanitizar y validar una URL para prevenir ataques
 */
export const sanitizeUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);

    // Permitir solo http y https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    // Bloquear IPs locales
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

// Uso
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
      rel="noopener noreferrer" // ¡Seguridad importante!
    >
      {children}
    </a>
  );
};
```

## Content Security Policy (CSP)

### Configuración de Encabezados CSP

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Evitar unsafe-* en prod
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

### CSP para Producción (Nginx)

```nginx
# nginx.conf
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.example.com; frame-ancestors 'none';" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

## Seguridad de Dependencias

### Auditorías Regulares

```bash
# Auditar vulnerabilidades
npm audit

# Auditar con correcciones automáticas
npm audit fix

# Auditar con correcciones mayores (¡precaución!)
npm audit fix --force

# Usar pnpm (mejor para seguridad)
pnpm audit
```

### Configuración de Dependabot

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

### Integración de Snyk

```bash
# Instalar Snyk CLI
npm install -g snyk

# Autenticar
snyk auth

# Escanear vulnerabilidades
snyk test

# Monitorear proyecto
snyk monitor
```

## Gestión de Secretos

### Variables de Entorno

```typescript
// ❌ MALO - NUNCA commitear secretos
const API_KEY = 'sk-1234567890abcdef'; // ¡PELIGRO!

// ✅ BUENO - Usar variables de entorno
const API_KEY = import.meta.env.VITE_API_KEY;

// Validar presencia de secretos al inicio
if (!API_KEY) {
  throw new Error('VITE_API_KEY is required');
}
```

### .env.example

```env
# .env.example (commitear este archivo)
VITE_API_BASE_URL=http://localhost:8000
VITE_API_KEY=your-api-key-here
VITE_AUTH_DOMAIN=auth.example.com
```

### .env (NUNCA commitear)

```env
# .env (agregar a .gitignore)
VITE_API_BASE_URL=https://api.production.com
VITE_API_KEY=sk-real-secret-key
VITE_AUTH_DOMAIN=auth.production.com
```

### .gitignore

```gitignore
# Secretos
.env
.env.local
.env.*.local
.env.production

# ¡No ignorar .env.example!
!.env.example
```

## Rate Limiting del Lado del Cliente

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

    // Limpiar peticiones antiguas
    this.requests = this.requests.filter((time) => time > windowStart);

    // Verificar límite
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

// Uso
const loginRateLimiter = new RateLimiter({
  maxRequests: 5, // 5 intentos
  windowMs: 15 * 60 * 1000 // 15 minutos
});

const LoginForm: FC = () => {
  const handleSubmit = async (data: LoginData) => {
    if (!loginRateLimiter.canMakeRequest()) {
      const waitTime = Math.ceil(loginRateLimiter.getRemainingTime() / 1000);
      toast.error(`Demasiados intentos. Espere ${waitTime} segundos.`);
      return;
    }

    await login(data);
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
};
```

## Logging y Monitoreo Seguro

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
   * Eliminar campos sensibles antes de registrar
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

    // Enviar a servicio de logging (Sentry, LogRocket, etc.)
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

// Uso
const handleLogin = async (credentials: LoginCredentials) => {
  try {
    const result = await loginUser(credentials);

    logger.log({
      level: 'info',
      message: 'User logged in successfully',
      userId: result.user.id
      // ¡la contraseña NO se registra!
    });

    return result;
  } catch (error) {
    logger.error('Login failed', error as Error, {
      email: credentials.email
      // ¡la contraseña NO se registra!
    });

    throw error;
  }
};
```

## Checklist de Seguridad

### Antes de Cada Release

- [ ] Auditar dependencias (`npm audit`)
- [ ] Sin secretos hardcodeados
- [ ] Encabezados CSP configurados
- [ ] HTTPS habilitado en todos lados
- [ ] Validación de entrada en cliente Y servidor
- [ ] Protección XSS (DOMPurify si HTML)
- [ ] Protección CSRF habilitada
- [ ] Rate limiting implementado
- [ ] Logs seguros (sin datos sensibles)
- [ ] Rutas protegidas configuradas
- [ ] Almacenamiento seguro de tokens
- [ ] URLs sanitizadas
- [ ] `rel="noopener noreferrer"` en enlaces externos

## Conclusión

La seguridad en React requiere:

1. ✅ **Validación**: Del lado del cliente Y servidor
2. ✅ **Sanitización**: Limpiar todos los datos de usuario
3. ✅ **Protección**: XSS, CSRF, inyección
4. ✅ **Autenticación**: Tokens seguros, rutas protegidas
5. ✅ **Monitoreo**: Logs seguros, auditorías regulares

**Regla de oro**: NUNCA confiar en datos de usuario. Siempre validar, sanitizar y asegurar.
