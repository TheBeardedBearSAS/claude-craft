---
description: Verificacion de Seguridad
---

# Verificacion de Seguridad

Realiza un analisis de seguridad exhaustivo de la aplicacion React para identificar vulnerabilidades y problemas de seguridad.

## Que Hace Este Comando

1. **Auditoria de Dependencias**
   - Escanear dependencias NPM en busca de vulnerabilidades conocidas
   - Verificar licencias de paquetes
   - Identificar paquetes obsoletos
   - Detectar dependencias no utilizadas

2. **Analisis de Codigo**
   - XSS (Cross-Site Scripting)
   - Inyeccion SQL
   - Exposicion de secretos
   - Practicas inseguras de codigo
   - Validacion de entrada

3. **Configuracion de Seguridad**
   - Content Security Policy (CSP)
   - Headers de seguridad HTTP
   - Politica CORS
   - Almacenamiento seguro de tokens
   - Variables de entorno

## Auditoria de Dependencias

### NPM Audit

```bash
# Ejecutar auditoria
npm audit

# Corregir vulnerabilidades automaticamente
npm audit fix

# Mostrar detalles de vulnerabilidades
npm audit --json
```

### Actualizaciones de Dependencias

```bash
# Verificar paquetes desactualizados
npm outdated

# Actualizar a versiones menores/parche
npm update

# Actualizar a versiones mayores (con precaucion)
npm install package@latest
```

## Analisis de Seguridad de Codigo

### Prevencion XSS

```typescript
// ❌ PELIGRO - Nunca hacer esto con datos de usuario
const UnsafeComponent = ({ html }: { html: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

// ✅ SEGURO - Sanear HTML primero
import DOMPurify from 'dompurify';

const SafeComponent = ({ html }: { html: string }) => {
  const sanitizedHtml = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
};
```

### Validacion de Entrada

```typescript
// ❌ MAL - Sin validacion
const handleSubmit = (data: any) => {
  api.create(data);
};

// ✅ BIEN - Validacion con Zod
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().min(0).max(120)
});

const handleSubmit = (data: unknown) => {
  const validated = schema.parse(data);
  api.create(validated);
};
```

### Almacenamiento Seguro

```typescript
// ❌ PELIGRO - localStorage es vulnerable a XSS
localStorage.setItem('token', jwtToken);

// ✅ MEJOR - HttpOnly Cookie (gestionada por el servidor)
// El servidor establece: Set-Cookie: auth_token=xxx; HttpOnly; Secure; SameSite=Strict

// ✅ ACEPTABLE - Si debe almacenarse en el cliente, encriptar
import CryptoJS from 'crypto-js';

const encryptToken = (token: string, secret: string): string => {
  return CryptoJS.AES.encrypt(token, secret).toString();
};

const encrypted = encryptToken(jwtToken, SECRET_KEY);
sessionStorage.setItem('auth', encrypted);
```

## Content Security Policy

### Configuracion de Headers

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.example.com"
      ].join('; ')
    }
  }
});
```

### Configuracion Nginx

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## Proteccion CSRF

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

// Anadir token CSRF a solicitudes
api.interceptors.request.use((config) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = csrfToken;
  }
  return config;
});
```

## Gestion de Secretos

### Variables de Entorno

```typescript
// ❌ MAL - NUNCA hacer commit de secretos
const API_KEY = 'sk-1234567890abcdef';

// ✅ BIEN - Usar variables de entorno
const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error('VITE_API_KEY es requerida');
}
```

### .env.example

```env
# .env.example (hacer commit de este archivo)
VITE_API_URL=http://localhost:8000
VITE_API_KEY=your-api-key-here
```

### .gitignore

```gitignore
# Secretos
.env
.env.local
.env.*.local

# No ignorar .env.example
!.env.example
```

## Autenticacion y Autorizacion

### Rutas Protegidas

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

### Validacion de Tokens

```typescript
import { jwtDecode } from 'jwt-decode';

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};
```

## Enlaces Externos Seguros

```typescript
// ✅ BIEN - Siempre usar rel para enlaces externos
<a
  href="https://external-site.com"
  target="_blank"
  rel="noopener noreferrer"
>
  Enlace Externo
</a>
```

## Limitacion de Velocidad

```typescript
// utils/rateLimit.ts
class RateLimiter {
  private requests: number[] = [];

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  canMakeRequest(): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    this.requests = this.requests.filter(time => time > windowStart);

    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }
}

// Uso
const limiter = new RateLimiter(5, 60000); // 5 solicitudes por minuto

const handleLogin = async () => {
  if (!limiter.canMakeRequest()) {
    toast.error('Demasiados intentos. Por favor espere.');
    return;
  }

  await login();
};
```

## Registro Seguro

```typescript
// utils/logger.ts
const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'apiKey'];

const sanitize = (data: any): any => {
  if (typeof data !== 'object' || data === null) return data;

  const sanitized = { ...data };

  for (const key in sanitized) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
};

export const logger = {
  log: (message: string, data?: any) => {
    console.log(message, sanitize(data));
  }
};
```

## Lista de Verificacion de Seguridad

- [ ] Auditoria de dependencias ejecutada
- [ ] Sin vulnerabilidades criticas
- [ ] CSP headers configurados
- [ ] HTTPS habilitado
- [ ] Validacion de entrada en todos los formularios
- [ ] Proteccion XSS implementada
- [ ] Proteccion CSRF implementada
- [ ] Secretos en variables de entorno
- [ ] Tokens almacenados de forma segura
- [ ] Enlaces externos tienen rel="noopener noreferrer"
- [ ] Rutas protegidas implementadas
- [ ] Registro no expone datos sensibles
- [ ] Limitacion de velocidad implementada

## Herramientas

- **npm audit** - Auditoria de dependencias
- **Snyk** - Seguridad de dependencias
- **DOMPurify** - Saneamiento de HTML
- **Zod** - Validacion de esquemas
- **Helmet** (servidor) - Headers de seguridad
- **OWASP ZAP** - Escaneo de seguridad

## Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/React_Security_Cheat_Sheet.html)
- [Guia de Seguridad Web de MDN](https://developer.mozilla.org/es/docs/Web/Security)
