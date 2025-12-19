# Sécurité React

## Principes de Sécurité Fondamentaux

### Defense in Depth (Défense en Profondeur)

Appliquer plusieurs couches de sécurité :
1. Validation côté client ET serveur
2. Échapper les données utilisateur
3. Utiliser HTTPS partout
4. Implémenter CSP (Content Security Policy)
5. Limiter les permissions
6. Logger les événements de sécurité

## XSS (Cross-Site Scripting) Prevention

### React Protège par Défaut

```typescript
// ✅ SÉCURISÉ - React échappe automatiquement le contenu
const UserProfile: FC<{ name: string }> = ({ name }) => {
  return <div>{name}</div>;
  // Si name = "<script>alert('xss')</script>"
  // React affiche le texte brut, pas le script
};

// ✅ SÉCURISÉ - React échappe les attributs
const UserLink: FC<{ url: string }> = ({ url }) => {
  return <a href={url}>Link</a>;
  // React nettoie les URLs malveillantes
};
```

### Dangers avec dangerouslySetInnerHTML

```typescript
// ❌ DANGEREUX - Ne JAMAIS faire ceci avec des données utilisateur
const UnsafeComponent: FC<{ html: string }> = ({ html }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
  // Si html contient un script malveillant, il sera exécuté !
};

// ✅ SÉCURISÉ - Sanitizer le HTML d'abord
import DOMPurify from 'dompurify';

const SafeComponent: FC<{ html: string }> = ({ html }) => {
  const sanitizedHtml = DOMPurify.sanitize(html);

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
};
```

### Installation de DOMPurify

```bash
npm install dompurify
npm install -D @types/dompurify
```

### Configuration DOMPurify

```typescript
// utils/sanitize.ts
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML pour prévenir les attaques XSS
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    // Autoriser seulement certains tags
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],

    // Autoriser seulement certains attributs
    ALLOWED_ATTR: ['href', 'title'],

    // Forcer tous les liens en target="_blank"
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
// ❌ MAUVAIS - Utiliser directement l'input utilisateur
const SearchResults: FC = () => {
  const [query] = useSearchParams();
  const searchTerm = query.get('q');

  return <h1>Results for: {searchTerm}</h1>;
  // Vulnérable à XSS via URL manipulation
};

// ✅ BON - Valider et nettoyer l'input
import { z } from 'zod';

const searchSchema = z.string().max(100).regex(/^[a-zA-Z0-9\s]+$/);

const SearchResults: FC = () => {
  const [query] = useSearchParams();
  const rawQuery = query.get('q') || '';

  // Valider avec Zod
  const result = searchSchema.safeParse(rawQuery);

  if (!result.success) {
    return <div>Invalid search query</div>;
  }

  return <h1>Results for: {result.data}</h1>;
};
```

## CSRF (Cross-Site Request Forgery) Protection

### Token CSRF dans les Requêtes

```typescript
// services/api.service.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true // Envoyer les cookies
});

// Intercepteur pour ajouter le token CSRF
apiClient.interceptors.request.use((config) => {
  // Récupérer le CSRF token depuis les cookies ou meta tag
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
 * Génère et stocke un token CSRF
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
 * Récupère le token CSRF
 */
export const getCsrfToken = (): string | undefined => {
  return Cookies.get('XSRF-TOKEN');
};

// Usage dans un formulaire
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

## Authentication et Authorization

### Stockage Sécurisé des Tokens

```typescript
// ❌ MAUVAIS - localStorage est vulnérable à XSS
localStorage.setItem('token', jwtToken);

// ❌ MAUVAIS - sessionStorage aussi
sessionStorage.setItem('token', jwtToken);

// ✅ BON - HttpOnly Cookie (géré par le serveur)
// Le serveur définit le cookie :
// Set-Cookie: auth_token=xxx; HttpOnly; Secure; SameSite=Strict

// ✅ ACCEPTABLE - Si vous devez stocker côté client, chiffrer
import CryptoJS from 'crypto-js';

const encryptToken = (token: string, secretKey: string): string => {
  return CryptoJS.AES.encrypt(token, secretKey).toString();
};

const decryptToken = (encryptedToken: string, secretKey: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Stocker le token chiffré
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
    // Rediriger vers login en gardant la route destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier les rôles si spécifiés
  if (requiredRole && user) {
    const hasRequiredRole = requiredRole.includes(user.role);

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// Usage dans le routing
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
 * Vérifie si un JWT est expiré
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
 * Récupère les données du JWT
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
    // Token expiré, demander un refresh ou logout
    refreshToken();
  }

  const tokenData = getTokenData(token);

  return {
    user: tokenData,
    isAuthenticated: !!tokenData
  };
};
```

## Input Validation et Sanitization

### Validation avec Zod

```typescript
import { z } from 'zod';

// Schémas de validation sécurisés
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
      // Autoriser seulement http et https
      return url.startsWith('https://') || url.startsWith('http://');
    },
    { message: 'URL must use HTTP or HTTPS protocol' }
  );

// Schéma de formulaire d'inscription
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

// Usage dans un composant
const RegisterForm: FC = () => {
  const form = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    // data est validé et sécurisé
    await registerUser(data);
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>;
};
```

### Sanitization des URLs

```typescript
// utils/url.ts

/**
 * Nettoie et valide une URL pour prévenir les attaques
 */
export const sanitizeUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);

    // Autoriser seulement http et https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    // Bloquer les IPs locales
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
      rel="noopener noreferrer" // Sécurité importante !
    >
      {children}
    </a>
  );
};
```

## Content Security Policy (CSP)

### Configuration CSP Headers

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Éviter unsafe-* en prod
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

### CSP pour Production (Nginx)

```nginx
# nginx.conf
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.example.com; frame-ancestors 'none';" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

## Sécurité des Dépendances

### Audit Régulier

```bash
# Audit des vulnérabilités
npm audit

# Audit avec correction automatique
npm audit fix

# Audit avec corrections majeures (attention !)
npm audit fix --force

# Utiliser pnpm (meilleur pour la sécurité)
pnpm audit
```

### Dépendabot Configuration

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
# Installer Snyk CLI
npm install -g snyk

# Authentifier
snyk auth

# Scanner les vulnérabilités
snyk test

# Monitorer le projet
snyk monitor
```

## Secrets Management

### Variables d'Environnement

```typescript
// ❌ MAUVAIS - Ne JAMAIS commit de secrets
const API_KEY = 'sk-1234567890abcdef'; // DANGER !

// ✅ BON - Utiliser des variables d'environnement
const API_KEY = import.meta.env.VITE_API_KEY;

// Valider la présence des secrets au démarrage
if (!API_KEY) {
  throw new Error('VITE_API_KEY is required');
}
```

### .env.example

```env
# .env.example (committer ce fichier)
VITE_API_BASE_URL=http://localhost:8000
VITE_API_KEY=your-api-key-here
VITE_AUTH_DOMAIN=auth.example.com
```

### .env (ne JAMAIS committer)

```env
# .env (ajouter à .gitignore)
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

# Ne pas ignorer .env.example !
!.env.example
```

## Rate Limiting Côté Client

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

    // Nettoyer les anciennes requêtes
    this.requests = this.requests.filter((time) => time > windowStart);

    // Vérifier la limite
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
  maxRequests: 5, // 5 tentatives
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

## Logging et Monitoring Sécurisé

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
   * Supprime les champs sensibles avant de logger
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

    // Envoyer au service de logging (Sentry, LogRocket, etc.)
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
      // password n'est PAS loggé !
    });

    return result;
  } catch (error) {
    logger.error('Login failed', error as Error, {
      email: credentials.email
      // password n'est PAS loggé !
    });

    throw error;
  }
};
```

## Checklist de Sécurité

### Avant Chaque Release

- [ ] Audit des dépendances (`npm audit`)
- [ ] Pas de secrets hardcodés
- [ ] CSP headers configurés
- [ ] HTTPS activé partout
- [ ] Validation des inputs côté client ET serveur
- [ ] XSS protection (DOMPurify si HTML)
- [ ] CSRF protection activée
- [ ] Rate limiting implémenté
- [ ] Logs sécurisés (pas de données sensibles)
- [ ] Protected routes configurées
- [ ] Token storage sécurisé
- [ ] URLs sanitized
- [ ] `rel="noopener noreferrer"` sur liens externes

## Conclusion

La sécurité en React nécessite :

1. ✅ **Validation** : Côté client ET serveur
2. ✅ **Sanitization** : Nettoyer toutes les données utilisateur
3. ✅ **Protection** : XSS, CSRF, injection
4. ✅ **Authentication** : Tokens sécurisés, routes protégées
5. ✅ **Monitoring** : Logs sécurisés, audit régulier

**Règle d'or** : Ne JAMAIS faire confiance aux données utilisateur. Toujours valider, sanitizer et sécuriser.
