# Sécurité Svelte 5 + SvelteKit — OWASP 2025

## Vue d'ensemble

La sécurité SvelteKit combine protections built-in (CSRF) avec validation serveur stricte.

**Principes** :
- ✅ CSRF built-in SvelteKit
- ✅ Validation serveur obligatoire (Zod/Valibot)
- ✅ Secrets jamais côté client
- ✅ CSP Level 3 via hooks
- ✅ Auth : Lucia, Auth.js, OAuth + PKCE

---

## OWASP Top 10:2025 — SvelteKit

| # | Menace | Défense SvelteKit |
|---|--------|-------------------|
| 1 | Broken Access Control | Hooks server + checks dans load/actions |
| 2 | Cryptographic Failures | Argon2id serveur, cookies httpOnly/secure |
| 3 | Injection | Validation Zod/Valibot, parameterized queries |
| 4 | Insecure Design | Load functions SSR, form actions, rate limiting |
| 5 | Security Misconfiguration | CSP strict, headers via handle hook |
| 6 | **Supply Chain Failures** | npm audit, SBOM, lockfile integrity |
| 7 | **Exceptional Conditions** | Error boundaries via +error.svelte |

---

## CSRF Protection

### Built-in SvelteKit

```svelte
<!-- CSRF automatique pour formulaires avec method="POST" -->
<form method="POST">
    <input name="email" type="email" required />
    <button type="submit">Submit</button>
</form>
```

**Aucune action nécessaire** : SvelteKit vérifie l'origine automatiquement.

### API Routes (vérifier origin)

```ts
// routes/api/products/+server.ts
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
    const origin = request.headers.get('origin');
    
    if (!origin || !['https://example.com', 'http://localhost:5173'].includes(origin)) {
        throw error(403, 'Forbidden');
    }

    // Process request
};
```

---

## XSS Protection

### {@html} AUDITÉ

```svelte
<script lang="ts">
import DOMPurify from 'isomorphic-dompurify';

let { content } = $props<{ content: string }>();

// ✅ BON : sanitize avant render
let sanitized = $derived(DOMPurify.sanitize(content));
</script>

{@html sanitized}

<!-- ❌ MAUVAIS : jamais render user input brut -->
<!-- {@html content} -->
```

### Échapper automatiquement

```svelte
<script lang="ts">
let { userName } = $props<{ userName: string }>();
</script>

<!-- ✅ Auto-escaped -->
<p>Hello, {userName}</p>

<!-- Même si userName = "<script>alert('xss')</script>" -->
<!-- Rendu : Hello, &lt;script&gt;alert('xss')&lt;/script&gt; -->
```

---

## Validation Serveur

### Zod Validation

```ts
// routes/auth/register/+page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(12).max(128),
    name: z.string().min(3).max(50),
});

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        
        const data = {
            email: formData.get('email'),
            password: formData.get('password'),
            name: formData.get('name'),
        };

        // Validation
        const result = registerSchema.safeParse(data);
        if (!result.success) {
            return fail(400, {
                errors: result.error.flatten().fieldErrors,
            });
        }

        // Hash password (Argon2id)
        const hashedPassword = await hashPassword(result.data.password);

        // Save user
        await db.users.create({
            ...result.data,
            password: hashedPassword,
        });

        return { success: true };
    },
};
```

### Valibot (alternative légère)

```ts
import * as v from 'valibot';

const registerSchema = v.object({
    email: v.pipe(v.string(), v.email()),
    password: v.pipe(v.string(), v.minLength(12), v.maxLength(128)),
    name: v.pipe(v.string(), v.minLength(3), v.maxLength(50)),
});

const result = v.safeParse(registerSchema, data);
```

---

## Authentification

### Lucia Auth (recommandé 2026)

```bash
npm install lucia @lucia-auth/adapter-prisma
```

```ts
// src/lib/server/auth.ts
import { Lucia } from 'lucia';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { prisma } from './db';

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: process.env.NODE_ENV === 'production',
        },
    },
    getUserAttributes: (attributes) => {
        return {
            email: attributes.email,
            name: attributes.name,
        };
    },
});
```

```ts
// hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get(lucia.sessionCookieName);
    
    if (!sessionId) {
        event.locals.user = null;
        event.locals.session = null;
        return resolve(event);
    }

    const { session, user } = await lucia.validateSession(sessionId);
    
    if (session?.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        event.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }
    
    if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        event.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }

    event.locals.user = user;
    event.locals.session = session;
    
    return resolve(event);
};
```

### Password Hashing (Argon2id)

```ts
// src/lib/server/crypto.ts
import { hash, verify } from '@node-rs/argon2';

// OWASP 2026 : 128 MiB RAM, t=4, p=1
export async function hashPassword(password: string): Promise<string> {
    return hash(password, {
        memoryCost: 128 * 1024, // 128 MiB
        timeCost: 4,
        parallelism: 1,
        outputLen: 32,
    });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
    return verify(hash, password);
}
```

---

## Cookies Sécurisés

```ts
// routes/auth/login/+page.server.ts
export const actions: Actions = {
    default: async ({ cookies }) => {
        // ✅ BON : httpOnly, secure, sameSite
        cookies.set('session', sessionToken, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 jours
        });
    },
};
```

```ts
// ❌ MAUVAIS : localStorage pour tokens
// localStorage.setItem('token', token); // Vulnérable XSS
```

---

## CSP (Content Security Policy)

### CSP Level 3 via hooks

```ts
// hooks.server.ts
import type { Handle } from '@sveltejs/kit';

const cspDirectives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'strict-dynamic'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", 'https://api.example.com'],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
};

const csp = Object.entries(cspDirectives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');

export const handle: Handle = async ({ event, resolve }) => {
    const response = await resolve(event);

    response.headers.set('Content-Security-Policy', csp);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');

    return response;
};
```

---

## Secrets Management

### $env/static/private (build-time)

```ts
// src/lib/server/config.ts
import { DATABASE_URL, JWT_SECRET } from '$env/static/private';

// ✅ BON : secrets server-only
export const config = {
    databaseUrl: DATABASE_URL,
    jwtSecret: JWT_SECRET,
};
```

### $env/dynamic/private (runtime)

```ts
// src/lib/server/config.ts
import { env } from '$env/dynamic/private';

// Runtime env vars
export const config = {
    apiKey: env.API_KEY,
};
```

```ts
// ❌ MAUVAIS : secrets côté client
// import { PUBLIC_API_KEY } from '$env/static/public'; // DANGER
```

---

## Rate Limiting

### @sveltejs/rate-limiter

```bash
npm install @sveltejs/rate-limiter
```

```ts
// hooks.server.ts
import { RateLimiter } from '@sveltejs/rate-limiter';

const limiter = new RateLimiter({
    IP: [10, 'h'], // 10 requests/hour par IP
    IPUA: [5, 'm'], // 5 requests/minute par IP+User-Agent
});

export const handle: Handle = async ({ event, resolve }) => {
    const status = await limiter.check(event);
    
    if (!status.limited) {
        return resolve(event);
    }

    return new Response('Too Many Requests', {
        status: 429,
        headers: {
            'Retry-After': String(status.retryAfter),
        },
    });
};
```

---

## OAuth 2.0 + PKCE

### arctic (OAuth client)

```bash
npm install arctic
```

```ts
// src/lib/server/oauth.ts
import { Google } from 'arctic';

export const google = new Google(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    'http://localhost:5173/auth/callback/google'
);
```

```ts
// routes/auth/login/google/+server.ts
import { google } from '$lib/server/oauth';
import { generateState, generateCodeVerifier } from 'arctic';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const url = await google.createAuthorizationURL(state, codeVerifier, {
        scopes: ['profile', 'email'],
    });

    cookies.set('google_oauth_state', state, { path: '/', httpOnly: true, maxAge: 60 * 10 });
    cookies.set('google_code_verifier', codeVerifier, { path: '/', httpOnly: true, maxAge: 60 * 10 });

    throw redirect(302, url.toString());
};
```

---

## Authorization (RBAC)

### Load Function Check

```ts
// routes/admin/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(303, '/auth/login');
    }

    if (locals.user.role !== 'admin') {
        throw redirect(303, '/');
    }

    // User is admin, return data
    return {
        users: await db.users.findMany(),
    };
};
```

### Action Check

```ts
// routes/admin/users/delete/+page.server.ts
export const actions: Actions = {
    default: async ({ locals, request }) => {
        if (!locals.user || locals.user.role !== 'admin') {
            throw error(403, 'Forbidden');
        }

        const formData = await request.formData();
        const userId = formData.get('userId');

        await db.users.delete({ where: { id: userId } });

        return { success: true };
    },
};
```

---

## Supply Chain Security

### npm audit

```bash
# Scan CVE
npm audit

# Fix automatique
npm audit fix

# CI : fail si CVE high/critical
npm audit --audit-level=high
```

### SBOM

```bash
# Générer SBOM
npx @cyclonedx/cyclonedx-npm --output-file sbom.json
```

---

## Logging Sécurisé

```ts
// src/lib/server/logger.ts
import pino from 'pino';

export const logger = pino({
    redact: {
        paths: ['password', 'token', 'secret', 'apiKey'],
        remove: true,
    },
});
```

```ts
// ✅ Loguer : connexions, changements permissions, erreurs auth
logger.info({ userId: user.id, ip: request.ip }, 'user login');

// ❌ NE PAS loguer : mots de passe, tokens
logger.info({ password: 'secret' }, 'auth failed'); // DANGER
```

---

## Checklist Sécurité

- [ ] CSRF activé (built-in SvelteKit)
- [ ] Validation serveur (Zod/Valibot) pour tous les inputs
- [ ] Secrets dans $env/static/private (jamais côté client)
- [ ] Passwords : Argon2id (128 MiB, t=4, p=1)
- [ ] Cookies : httpOnly, secure, sameSite=strict
- [ ] CSP Level 3 strict
- [ ] Headers sécurité (X-Frame-Options, HSTS, etc.)
- [ ] Rate limiting activé (@sveltejs/rate-limiter)
- [ ] OAuth + PKCE (arctic)
- [ ] Authorization checks dans load/actions
- [ ] {@html} uniquement avec DOMPurify
- [ ] npm audit 0 CVE high/critical
- [ ] SBOM généré (CycloneDX)
- [ ] Logs sans données sensibles (pino redact)

---

**Date de dernière mise à jour** : 2026-04
**Version** : 1.0.0
**Auteur** : The Bearded CTO
