---
description: Security Audit
---

# Security Audit

Perform a comprehensive security audit of the React application.

## What This Command Does

1. **Security Analysis**
   - Check for XSS vulnerabilities
   - Verify input validation
   - Audit dependencies
   - Check authentication implementation
   - Verify secrets management
   - Check CSP headers

2. **Tools Used**
   - npm audit
   - Snyk
   - ESLint security plugins
   - OWASP ZAP (optional)

3. **Generated Report**
   - Security vulnerabilities
   - Severity levels (critical, high, medium, low)
   - Remediation steps
   - Compliance status

## How to Use

```bash
# Run security audit
npm run security:check

# Or individual checks
npm audit
npm run lint:security
```

## Security Checks

### 1. XSS Prevention

```typescript
// ❌ DANGEROUS - Never use with user input
const UnsafeComponent = ({ html }: { html: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

// ✅ SAFE - Sanitize first
import DOMPurify from 'dompurify';

const SafeComponent = ({ html }: { html: string }) => {
  const sanitized = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};

// ✅ SAFE - React escapes by default
const SafeComponent = ({ text }: { text: string }) => {
  return <div>{text}</div>; // React escapes automatically
};
```

### 2. Input Validation

```typescript
// ❌ BAD - No validation
const handleSubmit = (email: string) => {
  sendEmail(email); // Dangerous!
};

// ✅ GOOD - Validation with Zod
import { z } from 'zod';

const emailSchema = z.string().email().max(255);

const handleSubmit = (email: string) => {
  const result = emailSchema.safeParse(email);
  if (!result.success) {
    throw new Error('Invalid email');
  }
  sendEmail(result.data);
};
```

### 3. Authentication

```typescript
// ❌ BAD - Token in localStorage (vulnerable to XSS)
localStorage.setItem('token', jwt);

// ✅ GOOD - HttpOnly cookie (server-side)
// Server sets: Set-Cookie: token=xxx; HttpOnly; Secure; SameSite=Strict

// ✅ ACCEPTABLE - If client-side storage needed, encrypt
import CryptoJS from 'crypto-js';

const encryptedToken = CryptoJS.AES.encrypt(token, secretKey).toString();
sessionStorage.setItem('auth', encryptedToken);
```

### 4. Protected Routes

```typescript
// ✅ GOOD - Route protection
export const ProtectedRoute: FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

### 5. CSRF Protection

```typescript
// ✅ GOOD - CSRF token in requests
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

## Dependency Security

### NPM Audit

```bash
# Check vulnerabilities
npm audit

# Auto-fix (caution with breaking changes)
npm audit fix

# Check without fixing
npm audit --audit-level=moderate
```

### Snyk

```bash
# Install Snyk
npm install -g snyk

# Authenticate
snyk auth

# Test for vulnerabilities
snyk test

# Monitor project
snyk monitor
```

### Keep Dependencies Updated

```bash
# Check outdated packages
npm outdated

# Update safely
npm update

# Check for major updates
npx npm-check-updates
```

## Security Headers

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

### Security Headers (Nginx)

```nginx
# nginx.conf
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## Secrets Management

### Environment Variables

```bash
# ❌ BAD - Secrets in code
const API_KEY = 'sk-1234567890abcdef';

# ✅ GOOD - Environment variables
const API_KEY = import.meta.env.VITE_API_KEY;
```

### .env File Management

```bash
# .gitignore
.env
.env.local
.env.*.local

# .env.example (commit this)
VITE_API_BASE_URL=http://localhost:8000
VITE_API_KEY=your-api-key-here

# .env (DO NOT commit)
VITE_API_BASE_URL=https://api.production.com
VITE_API_KEY=sk-real-secret-key
```

## Common Vulnerabilities

### 1. Open Redirects

```typescript
// ❌ VULNERABLE
const handleRedirect = () => {
  const url = new URLSearchParams(window.location.search).get('redirect');
  window.location.href = url; // Dangerous!
};

// ✅ SAFE - Validate redirect URL
const ALLOWED_DOMAINS = ['example.com', 'app.example.com'];

const handleRedirect = () => {
  const url = new URLSearchParams(window.location.search).get('redirect');

  try {
    const parsed = new URL(url);
    if (!ALLOWED_DOMAINS.includes(parsed.hostname)) {
      throw new Error('Invalid redirect domain');
    }
    window.location.href = url;
  } catch {
    window.location.href = '/';
  }
};
```

### 2. Insecure Direct Object Reference

```typescript
// ❌ VULNERABLE
const UserProfile = () => {
  const { userId } = useParams();
  const { data } = useQuery(['user', userId], () =>
    fetch(`/api/users/${userId}`).then(r => r.json())
  );
  // No authorization check!
};

// ✅ SAFE - Server-side authorization
// Server must verify: "Does the authenticated user have access to this resource?"
```

### 3. SQL Injection (Backend)

```typescript
// Frontend: Always use parameterized queries on backend
// ✅ GOOD - Zod validation before sending
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().max(100).regex(/^[a-zA-Z\s]+$/),
});
```

## ESLint Security Rules

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

## Security Checklist

- [ ] XSS protection implemented (DOMPurify for HTML)
- [ ] Input validation on all forms (Zod/Yup)
- [ ] Authentication properly implemented
- [ ] Protected routes configured
- [ ] CSRF tokens used
- [ ] Secrets in environment variables
- [ ] Dependencies audited (npm audit/Snyk)
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] CSP headers set
- [ ] No hardcoded secrets
- [ ] External links use `rel="noopener noreferrer"`
- [ ] File uploads validated
- [ ] Rate limiting implemented
- [ ] Logging doesn't expose sensitive data

## Security Testing

### Automated Testing

```typescript
// security.test.ts
describe('Security', () => {
  it('should sanitize HTML input', () => {
    const malicious = '<script>alert("xss")</script>';
    const sanitized = DOMPurify.sanitize(malicious);
    expect(sanitized).not.toContain('<script>');
  });

  it('should validate email format', () => {
    const result = emailSchema.safeParse('invalid-email');
    expect(result.success).toBe(false);
  });

  it('should protect routes', () => {
    render(<ProtectedRoute><AdminPage /></ProtectedRoute>);
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });
});
```

### Manual Testing

1. Test XSS vectors in all inputs
2. Try to access unauthorized routes
3. Test with expired/invalid tokens
4. Check for sensitive data in console/network tab
5. Verify HTTPS redirect
6. Test CSRF protection

## Tools

- **npm audit**: Built-in vulnerability scanner
- **Snyk**: Continuous security monitoring
- **OWASP ZAP**: Web application security scanner
- **DOMPurify**: HTML sanitization
- **helmet**: Security headers (server)
- **eslint-plugin-security**: Security linting

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://react.dev/learn/escape-hatches#security-pitfalls)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Snyk Advisor](https://snyk.io/advisor/)
