---
description: Angular Security Audit
model: haiku

---

# Angular Security Audit

Perform a comprehensive security audit of the Angular application.

## What This Command Does

1. **Vulnerability Scanning**
   - XSS vulnerabilities
   - CSRF protection
   - Injection risks
   - Authentication issues

2. **Dependency Audit**
   - npm audit results
   - Outdated packages
   - Known vulnerabilities

3. **Generated Report**
   - Security score
   - Vulnerabilities by severity
   - Remediation steps

## Security Checks

### 1. XSS Protection

```typescript
// ✅ Safe - Angular sanitizes automatically
@Component({
  template: `<div [innerHTML]="content"></div>`
})
export class SafeComponent {
  content = '<p>Safe content</p>';  // Sanitized by Angular
}

// ❌ Dangerous - Bypassing sanitization
@Component({
  template: `<div [innerHTML]="trustedContent"></div>`
})
export class DangerousComponent {
  trustedContent = this.sanitizer.bypassSecurityTrustHtml(userInput);
  // Only bypass for trusted sources!
}
```

### 2. CSRF Protection

```typescript
// ✅ Good - XSRF protection enabled
// app.config.ts
export const appConfig = {
  providers: [
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN'
      })
    )
  ]
};

// ❌ Bad - No CSRF protection
export const appConfig = {
  providers: [
    provideHttpClient() // No XSRF configuration
  ]
};
```

### 3. Authentication Security

```typescript
// ✅ Good - Secure token handling
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Use sessionStorage (not localStorage) for tokens
  private getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  // Check token expiration
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}

// ❌ Bad - Insecure token storage
localStorage.setItem('token', token);  // Vulnerable to XSS
```

### 4. Route Protection

```typescript
// ✅ Good - Protected routes
export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () => import('./admin/admin.component')
  }
];

// ❌ Bad - Unprotected sensitive routes
export const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component')
    // No guards!
  }
];
```

### 5. Sensitive Data Handling

```typescript
// ✅ Good - No sensitive data in code
// environment.ts
export const environment = {
  apiUrl: '/api',
  // API keys should come from backend, not frontend
};

// ❌ Bad - Secrets in code
export const environment = {
  apiKey: 'sk-12345...',  // NEVER do this!
  secretKey: 'secret...'   // NEVER do this!
};
```

### 6. Input Validation

```typescript
// ✅ Good - Validated input
const form = new FormGroup({
  email: new FormControl('', [
    Validators.required,
    Validators.email,
    Validators.maxLength(255)
  ]),
  password: new FormControl('', [
    Validators.required,
    Validators.minLength(12),
    strongPasswordValidator
  ])
});

// ❌ Bad - No validation
const form = new FormGroup({
  email: new FormControl(''),
  password: new FormControl('')
});
```

## Severity Levels

| Level | Description | Action |
|-------|-------------|--------|
| Critical | Immediate exploitation risk | Fix immediately |
| High | Serious vulnerability | Fix within 24h |
| Medium | Potential risk | Fix within 1 week |
| Low | Minor issue | Fix in next sprint |
| Info | Best practice | Consider fixing |

## Output Format

```
══════════════════════════════════════════════════════════════
ANGULAR SECURITY AUDIT REPORT
══════════════════════════════════════════════════════════════

📊 SECURITY SCORE: 75/100

🔴 CRITICAL (0)
──────────────────────────────────────────────────────────────
No critical vulnerabilities found.

🟠 HIGH (2)
──────────────────────────────────────────────────────────────
1. [H001] bypassSecurityTrustHtml with user input
   File: src/app/features/blog/blog-post.component.ts:45
   Risk: XSS vulnerability
   Fix: Remove bypassSecurityTrustHtml or validate input server-side

2. [H002] JWT stored in localStorage
   File: src/app/core/services/auth.service.ts:23
   Risk: Token theft via XSS
   Fix: Use sessionStorage or httpOnly cookies

🟡 MEDIUM (3)
──────────────────────────────────────────────────────────────
1. [M001] Missing CSRF protection
   File: src/app/app.config.ts
   Risk: Cross-site request forgery
   Fix: Add withXsrfConfiguration()

2. [M002] Unprotected admin route
   File: src/app/app.routes.ts:45
   Risk: Unauthorized access
   Fix: Add authGuard and roleGuard

3. [M003] Weak password requirements
   File: src/app/features/auth/register.component.ts
   Risk: Weak passwords
   Fix: Add strong password validator

🟢 LOW (2)
──────────────────────────────────────────────────────────────
1. [L001] Console.log in production
   Files: 5 files
   Risk: Information disclosure
   Fix: Remove or guard console statements

2. [L002] Missing CSP headers
   Risk: Script injection
   Fix: Configure Content-Security-Policy

📦 DEPENDENCY AUDIT
──────────────────────────────────────────────────────────────
npm audit results:
  Critical: 0
  High: 1 (lodash - prototype pollution)
  Medium: 2
  Low: 5

Outdated packages:
  @angular/core: 17.0.0 → 18.0.0 (security patches)
  rxjs: 7.5.0 → 7.8.0

📋 RECOMMENDATIONS
──────────────────────────────────────────────────────────────
1. Fix HIGH severity issues immediately
2. Run: npm audit fix
3. Update Angular to latest version
4. Configure CSP headers on server
5. Add security monitoring

══════════════════════════════════════════════════════════════
```

## Security Checklist

- [ ] No bypassSecurityTrust* with user input
- [ ] CSRF protection enabled
- [ ] Tokens stored securely (not localStorage)
- [ ] All sensitive routes protected
- [ ] No secrets in source code
- [ ] Input validation on all forms
- [ ] npm audit shows no critical/high
- [ ] Dependencies up to date
- [ ] CSP headers configured
- [ ] HTTPS enforced in production
