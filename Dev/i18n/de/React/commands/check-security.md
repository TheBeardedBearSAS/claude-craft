---
description: Sicherheits-Audit
---

# Sicherheits-Audit

Ein umfassendes Sicherheits-Audit der React-Anwendung durchführen.

## Was dieser Befehl tut

1. **Sicherheitsanalyse**
   - XSS-Schwachstellen prüfen
   - Eingabevalidierung verifizieren
   - Abhängigkeiten auditieren
   - Authentifizierungsimplementierung prüfen
   - Secrets-Management verifizieren
   - CSP-Header prüfen

2. **Verwendete Tools**
   - npm audit
   - Snyk
   - ESLint-Sicherheits-Plugins
   - OWASP ZAP (optional)

3. **Generierter Bericht**
   - Sicherheitsschwachstellen
   - Schweregrade (kritisch, hoch, mittel, niedrig)
   - Behebungsschritte
   - Konformitätsstatus

## Verwendung

```bash
# Sicherheits-Audit ausführen
npm run security:check

# Oder einzelne Prüfungen
npm audit
npm run lint:security
```

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## Sicherheitsprüfungen

### 1. XSS-Prävention

```typescript
// ❌ GEFÄHRLICH - Niemals mit Benutzereingaben verwenden
const UnsafeComponent = ({ html }: { html: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

// ✅ SICHER - Zuerst bereinigen
import DOMPurify from 'dompurify';

const SafeComponent = ({ html }: { html: string }) => {
  const sanitized = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};

// ✅ SICHER - React escaped standardmäßig
const SafeComponent = ({ text }: { text: string }) => {
  return <div>{text}</div>; // React escaped automatisch
};
```

### 2. Eingabevalidierung

```typescript
// ❌ SCHLECHT - Keine Validierung
const handleSubmit = (email: string) => {
  sendEmail(email); // Gefährlich!
};

// ✅ GUT - Validierung mit Zod
import { z } from 'zod';

const emailSchema = z.string().email().max(255);

const handleSubmit = (email: string) => {
  const result = emailSchema.safeParse(email);
  if (!result.success) {
    throw new Error('Ungültige E-Mail-Adresse');
  }
  sendEmail(result.data);
};
```

### 3. Authentifizierung

```typescript
// ❌ SCHLECHT - Token in localStorage (anfällig für XSS)
localStorage.setItem('token', jwt);

// ✅ GUT - HttpOnly-Cookie (serverseitig)
// Server setzt: Set-Cookie: token=xxx; HttpOnly; Secure; SameSite=Strict

// ✅ AKZEPTABEL - Wenn clientseitige Speicherung erforderlich, verschlüsseln
import CryptoJS from 'crypto-js';

const encryptedToken = CryptoJS.AES.encrypt(token, secretKey).toString();
sessionStorage.setItem('auth', encryptedToken);
```

### 4. Geschützte Routen

```typescript
// ✅ GUT - Routenschutz
export const ProtectedRoute: FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

### 5. CSRF-Schutz

```typescript
// ✅ GUT - CSRF-Token in Anfragen
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL,
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content');

  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = csrfToken;
  }

  return config;
});
```

## Abhängigkeitssicherheit

### NPM Audit

```bash
# Schwachstellen prüfen
npm audit

# Automatisch beheben (Vorsicht bei Breaking Changes)
npm audit fix

# Prüfen ohne Behebung
npm audit --audit-level=moderate
```

### Snyk

```bash
# Snyk installieren
npm install -g snyk

# Authentifizieren
snyk auth

# Auf Schwachstellen prüfen
snyk test

# Projekt überwachen
snyk monitor
```

### Abhängigkeiten aktuell halten

```bash
# Veraltete Pakete prüfen
npm outdated

# Sicher aktualisieren
npm update

# Auf größere Updates prüfen
npx npm-check-updates
```

## Sicherheits-Header

### Content Security Policy

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
        "font-src 'self'",
        "connect-src 'self' https://api.example.com",
        "frame-ancestors 'none'",
      ].join('; '),
    },
  },
});
```

### Sicherheits-Header (Nginx)

```nginx
# nginx.conf
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## Secrets-Management

### Umgebungsvariablen

```bash
# ❌ SCHLECHT - Secrets im Code
const API_KEY = 'sk-1234567890abcdef';

# ✅ GUT - Umgebungsvariablen
const API_KEY = import.meta.env.VITE_API_KEY;
```

### .env-Dateiverwaltung

```bash
# .gitignore
.env
.env.local
.env.*.local

# .env.example (committen)
VITE_API_BASE_URL=http://localhost:8000
VITE_API_KEY=ihr-api-key-hier

# .env (NICHT committen)
VITE_API_BASE_URL=https://api.production.com
VITE_API_KEY=sk-echter-geheimer-schluessel
```

## Häufige Schwachstellen

### 1. Offene Weiterleitungen

```typescript
// ❌ ANFÄLLIG
const handleRedirect = () => {
  const url = new URLSearchParams(window.location.search).get('redirect');
  window.location.href = url; // Gefährlich!
};

// ✅ SICHER - Weiterleitungs-URL validieren
const ALLOWED_DOMAINS = ['example.com', 'app.example.com'];

const handleRedirect = () => {
  const url = new URLSearchParams(window.location.search).get('redirect');

  try {
    const parsed = new URL(url);
    if (!ALLOWED_DOMAINS.includes(parsed.hostname)) {
      throw new Error('Ungültige Weiterleitungsdomain');
    }
    window.location.href = url;
  } catch {
    window.location.href = '/';
  }
};
```

### 2. Unsicherer direkter Objektzugriff

```typescript
// ❌ ANFÄLLIG
const UserProfile = () => {
  const { userId } = useParams();
  const { data } = useQuery(['user', userId], () =>
    fetch(`/api/users/${userId}`).then(r => r.json())
  );
  // Keine Autorisierungsprüfung!
};

// ✅ SICHER - Serverseitige Autorisierung
// Server muss prüfen: "Hat der authentifizierte Benutzer Zugriff auf diese Ressource?"
```

### 3. SQL-Injection (Backend)

```typescript
// Frontend: Immer parametrisierte Abfragen im Backend verwenden
// ✅ GUT - Zod-Validierung vor dem Senden
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().max(100).regex(/^[a-zA-Z\s]+$/),
});
```

## ESLint-Sicherheitsregeln

```json
// .eslintrc.json
{
  "plugins": ["security"],
  "extends": ["plugin:security/recommended"],
  "rules": {
    "security/detect-object-injection": "warn",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-child-process": "error",
    "security/detect-disable-mustache-escape": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-no-csrf-before-method-override": "error",
    "security/detect-non-literal-fs-filename": "error",
    "security/detect-non-literal-require": "error",
    "security/detect-possible-timing-attacks": "error",
    "security/detect-pseudoRandomBytes": "error"
  }
}
```

## Sicherheits-Checkliste

- [ ] XSS-Schutz implementiert (DOMPurify für HTML)
- [ ] Eingabevalidierung bei allen Formularen (Zod/Yup)
- [ ] Authentifizierung korrekt implementiert
- [ ] Geschützte Routen konfiguriert
- [ ] CSRF-Tokens verwendet
- [ ] Secrets in Umgebungsvariablen
- [ ] Abhängigkeiten auditiert (npm audit/Snyk)
- [ ] Sicherheits-Header konfiguriert
- [ ] HTTPS erzwungen
- [ ] CSP-Header gesetzt
- [ ] Keine hardcodierten Secrets
- [ ] Externe Links verwenden `rel="noopener noreferrer"`
- [ ] Dateiuploads validiert
- [ ] Rate-Limiting implementiert
- [ ] Logging gibt keine sensiblen Daten preis

## Sicherheitstests

### Automatisierte Tests

```typescript
// security.test.ts
describe('Sicherheit', () => {
  it('sollte HTML-Eingabe bereinigen', () => {
    const malicious = '<script>alert("xss")</script>';
    const sanitized = DOMPurify.sanitize(malicious);
    expect(sanitized).not.toContain('<script>');
  });

  it('sollte E-Mail-Format validieren', () => {
    const result = emailSchema.safeParse('ungueltige-email');
    expect(result.success).toBe(false);
  });

  it('sollte Routen schützen', () => {
    render(<ProtectedRoute><AdminPage /></ProtectedRoute>);
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });
});
```

### Manuelle Tests

1. XSS-Vektoren in allen Eingaben testen
2. Versuchen, auf nicht autorisierte Routen zuzugreifen
3. Mit abgelaufenen/ungültigen Tokens testen
4. Auf sensible Daten in Konsole/Netzwerk-Tab prüfen
5. HTTPS-Weiterleitung verifizieren
6. CSRF-Schutz testen

## Tools

- **npm audit**: Eingebauter Schwachstellen-Scanner
- **Snyk**: Kontinuierliche Sicherheitsüberwachung
- **OWASP ZAP**: Web-Anwendungs-Sicherheitsscanner
- **DOMPurify**: HTML-Sanitization
- **helmet**: Sicherheits-Header (Server)
- **eslint-plugin-security**: Sicherheits-Linting

## Ressourcen

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React-Sicherheits-Best-Practices](https://react.dev/learn/escape-hatches#security-pitfalls)
- [MDN Web-Sicherheit](https://developer.mozilla.org/de/docs/Web/Security)
- [Snyk Advisor](https://snyk.io/advisor/)
