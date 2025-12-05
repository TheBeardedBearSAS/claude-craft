# Seguranca React

## Principios Fundamentais de Seguranca

### Defesa em Profundidade

Aplicar multiplas camadas de seguranca:
1. Validar no cliente E no servidor
2. Escapar dados do usuario
3. Usar HTTPS em todos os lugares
4. Implementar CSP (Content Security Policy)
5. Limitar permissoes
6. Registrar eventos de seguranca

## Prevencao de XSS (Cross-Site Scripting)

### React Protege por Padrao

```typescript
// ✅ SEGURO - React escapa automaticamente o conteudo
const UserProfile: FC<{ name: string }> = ({ name }) => {
  return <div>{name}</div>;
  // Se name = "<script>alert('xss')</script>"
  // React exibe o texto bruto, nao executa o script
};

// ✅ SEGURO - React escapa atributos
const UserLink: FC<{ url: string }> = ({ url }) => {
  return <a href={url}>Link</a>;
  // React sanitiza URLs maliciosas
};
```

### Perigos com dangerouslySetInnerHTML

```typescript
// ❌ PERIGOSO - NUNCA faca isso com dados do usuario
const UnsafeComponent: FC<{ html: string }> = ({ html }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
  // Se html contem script malicioso, ele sera executado!
};

// ✅ SEGURO - Sanitizar HTML primeiro
import DOMPurify from 'dompurify';

const SafeComponent: FC<{ html: string }> = ({ html }) => {
  const sanitizedHtml = DOMPurify.sanitize(html);

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
};
```

### Instalacao do DOMPurify

```bash
npm install dompurify
npm install -D @types/dompurify
```

### Configuracao do DOMPurify

```typescript
// utils/sanitize.ts
import DOMPurify from 'dompurify';

/**
 * Sanitizar HTML para prevenir ataques XSS
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    // Permitir apenas certas tags
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],

    // Permitir apenas certos atributos
    ALLOWED_ATTR: ['href', 'title'],

    // Forcar todos os links para target="_blank"
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i
  });
};

// Uso
const SafeRichText: FC<{ content: string }> = ({ content }) => {
  const sanitized = sanitizeHtml(content);

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};
```

### Sanitizar Input do Usuario

```typescript
// ❌ RUIM - Usar input do usuario diretamente
const SearchResults: FC = () => {
  const [query] = useSearchParams();
  const searchTerm = query.get('q');

  return <h1>Resultados para: {searchTerm}</h1>;
  // Vulneravel a XSS via manipulacao de URL
};

// ✅ BOM - Validar e sanitizar input
import { z } from 'zod';

const searchSchema = z.string().max(100).regex(/^[a-zA-Z0-9\s]+$/);

const SearchResults: FC = () => {
  const [query] = useSearchParams();
  const rawQuery = query.get('q') || '';

  // Validar com Zod
  const result = searchSchema.safeParse(rawQuery);

  if (!result.success) {
    return <div>Consulta de busca invalida</div>;
  }

  return <h1>Resultados para: {result.data}</h1>;
};
```

## Protecao CSRF (Cross-Site Request Forgery)

### Token CSRF em Requisicoes

```typescript
// services/api.service.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true // Enviar cookies
});

// Interceptor para adicionar token CSRF
apiClient.interceptors.request.use((config) => {
  // Obter token CSRF de cookies ou meta tag
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = csrfToken;
  }

  return config;
});

export { apiClient };
```

### Padrao Double Submit Cookie

```typescript
// utils/csrf.ts
import Cookies from 'js-cookie';

/**
 * Gerar e armazenar um token CSRF
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
 * Obter o token CSRF
 */
export const getCsrfToken = (): string | undefined => {
  return Cookies.get('XSRF-TOKEN');
};

// Uso em um formulario
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

## Autenticacao e Autorizacao

### Armazenamento Seguro de Tokens

```typescript
// ❌ RUIM - localStorage e vulneravel a XSS
localStorage.setItem('token', jwtToken);

// ❌ RUIM - sessionStorage tambem
sessionStorage.setItem('token', jwtToken);

// ✅ BOM - Cookie HttpOnly (gerenciado pelo servidor)
// Servidor define o cookie:
// Set-Cookie: auth_token=xxx; HttpOnly; Secure; SameSite=Strict

// ✅ ACEITAVEL - Se precisa armazenar no cliente, criptografar
import CryptoJS from 'crypto-js';

const encryptToken = (token: string, secretKey: string): string => {
  return CryptoJS.AES.encrypt(token, secretKey).toString();
};

const decryptToken = (encryptedToken: string, secretKey: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Armazenar token criptografado
const secretKey = import.meta.env.VITE_ENCRYPTION_KEY;
const encryptedToken = encryptToken(jwtToken, secretKey);
sessionStorage.setItem('auth', encryptedToken);
```

### Rotas Protegidas

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
    // Redirecionar para login, mantendo rota de destino
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar funcoes se especificado
  if (requiredRole && user) {
    const hasRequiredRole = requiredRole.includes(user.role);

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// Uso no roteamento
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

### Validacao de Token JWT

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
 * Verificar se um JWT esta expirado
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
 * Obter dados do JWT
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
    // Token expirado, solicitar refresh ou fazer logout
    refreshToken();
  }

  const tokenData = getTokenData(token);

  return {
    user: tokenData,
    isAuthenticated: !!tokenData
  };
};
```

## Validacao e Sanitizacao de Input

### Validacao com Zod

```typescript
import { z } from 'zod';

// Schemas de validacao seguros
export const emailSchema = z
  .string()
  .email('Formato de email invalido')
  .max(255, 'Email muito longo')
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(128, 'Senha muito longa')
  .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiuscula')
  .regex(/[a-z]/, 'Deve conter pelo menos uma letra minuscula')
  .regex(/[0-9]/, 'Deve conter pelo menos um numero')
  .regex(/[^A-Za-z0-9]/, 'Deve conter pelo menos um caractere especial');

export const usernameSchema = z
  .string()
  .min(3, 'Nome de usuario deve ter pelo menos 3 caracteres')
  .max(20, 'Nome de usuario muito longo')
  .regex(/^[a-zA-Z0-9_]+$/, 'Nome de usuario pode conter apenas letras, numeros e underscores')
  .trim();

export const urlSchema = z
  .string()
  .url('URL invalida')
  .refine(
    (url) => {
      // Permitir apenas http e https
      return url.startsWith('https://') || url.startsWith('http://');
    },
    { message: 'URL deve usar protocolo HTTP ou HTTPS' }
  );

// Schema de formulario de registro
export const registerSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas nao coincidem',
    path: ['confirmPassword']
  });

// Uso em um componente
const RegisterForm: FC = () => {
  const form = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    // data esta validado e seguro
    await registerUser(data);
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>;
};
```

### Sanitizacao de URL

```typescript
// utils/url.ts

/**
 * Sanitizar e validar uma URL para prevenir ataques
 */
export const sanitizeUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);

    // Permitir apenas http e https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    // Bloquear IPs locais
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
      rel="noopener noreferrer" // Importante para seguranca!
    >
      {children}
    </a>
  );
};
```

## Content Security Policy (CSP)

### Configuracao de Headers CSP

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Evitar unsafe-* em prod
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://api.exemplo.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ')
    }
  }
});
```

### CSP para Producao (Nginx)

```nginx
# nginx.conf
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.exemplo.com; frame-ancestors 'none';" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

## Seguranca de Dependencias

### Auditorias Regulares

```bash
# Auditar vulnerabilidades
npm audit

# Auditar com correcoes automaticas
npm audit fix

# Auditar com correcoes major (cuidado!)
npm audit fix --force

# Usar pnpm (melhor para seguranca)
pnpm audit
```

### Configuracao do Dependabot

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
      - 'seu-usuario'
    commit-message:
      prefix: 'chore(deps)'
    labels:
      - 'dependencias'
      - 'seguranca'
```

### Integracao Snyk

```bash
# Instalar CLI Snyk
npm install -g snyk

# Autenticar
snyk auth

# Escanear vulnerabilidades
snyk test

# Monitorar projeto
snyk monitor
```

## Gerenciamento de Segredos

### Variaveis de Ambiente

```typescript
// ❌ RUIM - NUNCA comitar segredos
const API_KEY = 'sk-1234567890abcdef'; // PERIGO!

// ✅ BOM - Usar variaveis de ambiente
const API_KEY = import.meta.env.VITE_API_KEY;

// Validar presenca de segredos na inicializacao
if (!API_KEY) {
  throw new Error('VITE_API_KEY e obrigatorio');
}
```

### .env.example

```env
# .env.example (comitar este arquivo)
VITE_API_BASE_URL=http://localhost:8000
VITE_API_KEY=sua-chave-api-aqui
VITE_AUTH_DOMAIN=auth.exemplo.com
```

### .env (NUNCA comitar)

```env
# .env (adicionar ao .gitignore)
VITE_API_BASE_URL=https://api.producao.com
VITE_API_KEY=sk-chave-secreta-real
VITE_AUTH_DOMAIN=auth.producao.com
```

### .gitignore

```gitignore
# Segredos
.env
.env.local
.env.*.local
.env.production

# Nao ignorar .env.example!
!.env.example
```

## Rate Limiting Client-Side

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

    // Limpar requisicoes antigas
    this.requests = this.requests.filter((time) => time > windowStart);

    // Verificar limite
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
  maxRequests: 5, // 5 tentativas
  windowMs: 15 * 60 * 1000 // 15 minutos
});

const LoginForm: FC = () => {
  const handleSubmit = async (data: LoginData) => {
    if (!loginRateLimiter.canMakeRequest()) {
      const waitTime = Math.ceil(loginRateLimiter.getRemainingTime() / 1000);
      toast.error(`Muitas tentativas. Aguarde ${waitTime} segundos.`);
      return;
    }

    await login(data);
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
};
```

## Logging e Monitoramento Seguros

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
   * Remover campos sensiveis antes de logar
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

    // Enviar para servico de logging (Sentry, LogRocket, etc.)
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
      message: 'Usuario logado com sucesso',
      userId: result.user.id
      // password NAO e logado!
    });

    return result;
  } catch (error) {
    logger.error('Login falhou', error as Error, {
      email: credentials.email
      // password NAO e logado!
    });

    throw error;
  }
};
```

## Checklist de Seguranca

### Antes de Cada Release

- [ ] Auditar dependencias (`npm audit`)
- [ ] Sem segredos hardcoded
- [ ] Headers CSP configurados
- [ ] HTTPS habilitado em todos os lugares
- [ ] Validacao de input no cliente E servidor
- [ ] Protecao XSS (DOMPurify se HTML)
- [ ] Protecao CSRF habilitada
- [ ] Rate limiting implementado
- [ ] Logs seguros (sem dados sensiveis)
- [ ] Rotas protegidas configuradas
- [ ] Armazenamento seguro de tokens
- [ ] URLs sanitizadas
- [ ] `rel="noopener noreferrer"` em links externos

## Conclusao

Seguranca em React requer:

1. ✅ **Validacao**: Cliente E servidor
2. ✅ **Sanitizacao**: Limpar todos os dados do usuario
3. ✅ **Protecao**: XSS, CSRF, injecao
4. ✅ **Autenticacao**: Tokens seguros, rotas protegidas
5. ✅ **Monitoramento**: Logs seguros, auditorias regulares

**Regra de ouro**: NUNCA confie em dados do usuario. Sempre validar, sanitizar e proteger.
