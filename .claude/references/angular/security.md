# Angular Security Best Practices

**Version documentée :** Angular 21 (latest stable, LTS) / Angular 22 (en RC)

## Overview

Angular fournit des fonctionnalités de sécurité intégrées pour protéger contre les vulnérabilités courantes. Ce guide couvre les best practices de sécurité pour les applications Angular.

## XSS (Cross-Site Scripting) Protection

### Built-in Sanitization

Angular automatically sanitizes values before inserting them into the DOM:

```typescript
// ✅ Safe - Angular sanitizes automatically
@Component({
  template: `
    <div [innerHTML]="userContent"></div>
    <a [href]="userLink">Link</a>
  `
})
export class SafeComponent {
  userContent = '<script>alert("xss")</script>'; // Sanitized
  userLink = 'javascript:alert("xss")';          // Sanitized
}
```

### Security Contexts

Angular recognizes these security contexts:
- **HTML**: Used with `[innerHTML]`
- **Style**: Used with `[style]`
- **URL**: Used with `[href]`, `[src]`
- **Resource URL**: Used with `<iframe [src]>`, `<object [data]>`

### Bypassing Sanitization (Use with Caution)

Only bypass when you trust the source completely:

```typescript
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({...})
export class TrustedContentComponent {
  private sanitizer = inject(DomSanitizer);

  // Only for trusted content (e.g., from your own CMS)
  trustedHtml: SafeHtml;

  loadTrustedContent(html: string): void {
    // ⚠️ Only use for content you control
    this.trustedHtml = this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
```

### Never Trust User Input

```typescript
// ❌ DANGEROUS - Never do this
@Component({
  template: `<div [innerHTML]="sanitizer.bypassSecurityTrustHtml(userInput)"></div>`
})
export class DangerousComponent {
  userInput: string; // From user - NEVER trust
}

// ✅ Safe - Let Angular sanitize
@Component({
  template: `<div [innerHTML]="userInput"></div>`
})
export class SafeComponent {
  userInput: string; // Automatically sanitized
}
```

## CSRF (Cross-Site Request Forgery) Protection

### HttpClient XSRF Module

```typescript
// app.config.ts
import { provideHttpClient, withXsrfConfiguration } from '@angular/common/http';

export const appConfig = {
  providers: [
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',      // Cookie name from server
        headerName: 'X-XSRF-TOKEN'     // Header name to send
      })
    )
  ]
};
```

### Server-Side Configuration

Ensure your backend:
1. Sets the XSRF cookie on authentication
2. Validates the token on state-changing requests (POST, PUT, DELETE)

```typescript
// Example Express.js middleware
app.use(csrf({ cookie: true }));

app.use((req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  next();
});
```

## Authentication Security

### JWT Token Handling

```typescript
// auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_KEY = 'refresh_token';

  // ✅ Store tokens securely
  storeTokens(accessToken: string, refreshToken: string): void {
    // Use sessionStorage for access token (cleared on tab close)
    sessionStorage.setItem(this.TOKEN_KEY, accessToken);

    // Use httpOnly cookie for refresh token (set by server)
    // Never store refresh token in localStorage/sessionStorage
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  // ✅ Clear tokens on logout
  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    // Server should invalidate refresh token
  }

  // ✅ Token expiration check
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
```

### Auth Interceptor with Token Refresh

```typescript
// auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Skip auth endpoints
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  // Add token if available
  if (token && !authService.isTokenExpired(token)) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Try to refresh token
        return authService.refreshToken().pipe(
          switchMap(newToken => {
            const newReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` }
            });
            return next(newReq);
          }),
          catchError(() => {
            authService.logout();
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
```

## Route Protection

### Auth Guard

```typescript
// auth.guard.ts
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Store intended URL for redirect after login
  const currentUrl = router.routerState.snapshot.url;
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: currentUrl }
  });
};
```

### Role-Based Guard

```typescript
// role.guard.ts
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUser();

    if (!user) {
      return router.createUrlTree(['/auth/login']);
    }

    if (!allowedRoles.includes(user.role)) {
      return router.createUrlTree(['/unauthorized']);
    }

    return true;
  };
};

// Usage in routes
export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./admin/admin.component')
  }
];
```

## Content Security Policy (CSP)

### Recommended CSP Headers

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

### Angular-specific CSP

Angular requires `'unsafe-inline'` for styles and may need `'unsafe-eval'` for JIT compilation:

```typescript
// For production with AOT compilation
"script-src 'self';"
"style-src 'self' 'unsafe-inline';"  // Required for Angular styles
```

## Trusted Types (Angular 16+)

### Enable Trusted Types

```typescript
// polyfills.ts or main.ts
if (typeof window !== 'undefined' && window.trustedTypes) {
  // Angular creates its own policy
  console.log('Trusted Types supported');
}
```

### CSP for Trusted Types

```
Content-Security-Policy:
  require-trusted-types-for 'script';
  trusted-types angular angular#unsafe-bypass;
```

## Secure HTTP Headers

### Server Configuration

```nginx
# nginx.conf
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

## Sensitive Data Protection

### Environment Variables

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  // ❌ Never store secrets in environment files
  // apiKey: 'secret-key'  // WRONG!
};

// ✅ Use backend proxy or secure vault
```

### Logging Security

```typescript
// ❌ Never log sensitive data
console.log('User password:', password);
console.log('Token:', authToken);

// ✅ Log safely
console.log('User logged in:', userId);
console.log('Request to:', endpoint);
```

## Input Validation

### Client-Side Validation

```typescript
// validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// ✅ Custom validators
export const strongPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;

  if (!value) return null;

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumeric = /[0-9]/.test(value);
  const hasSpecial = /[!@#$%^&*]/.test(value);
  const minLength = value.length >= 12;

  const valid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial && minLength;

  return valid ? null : { strongPassword: true };
};

// Usage
const form = new FormGroup({
  password: new FormControl('', [
    Validators.required,
    strongPasswordValidator
  ])
});
```

### Sanitize User Input

```typescript
// input-sanitizer.service.ts
@Injectable({ providedIn: 'root' })
export class InputSanitizerService {
  sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .substring(0, 1000);   // Limit length
  }

  sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }
}
```

## Dependency Security

### Regular Audits

```bash
# Check for vulnerabilities
npm audit

# Auto-fix where possible
npm audit fix

# Check for outdated packages
npm outdated

# Update Angular
ng update @angular/core @angular/cli
```

### Lock File

Always commit `package-lock.json`:

```bash
# Install exact versions
npm ci  # Instead of npm install in CI
```

## Security Checklist

### Application Security

- [ ] Angular sanitization not bypassed for user content
- [ ] CSRF protection enabled
- [ ] Auth tokens stored securely (not in localStorage)
- [ ] JWT token expiration checked
- [ ] Route guards implemented
- [ ] Role-based access control
- [ ] Input validation on client and server

### HTTP Security

- [ ] HTTPS only in production
- [ ] Security headers configured
- [ ] CSP headers set
- [ ] CORS properly configured
- [ ] API endpoints protected

### Code Security

- [ ] No secrets in source code
- [ ] No sensitive data in logs
- [ ] Dependencies regularly audited
- [ ] Angular and dependencies up to date
- [ ] Source maps disabled in production

### Infrastructure Security

- [ ] Trusted Types enabled (if supported)
- [ ] Subresource Integrity for external scripts
- [ ] Cookie security attributes (Secure, HttpOnly, SameSite)

## Security Testing

### Tools

- **OWASP ZAP**: Automated security scanning
- **Burp Suite**: Manual penetration testing
- **npm audit**: Dependency vulnerability scanning
- **Snyk**: Continuous security monitoring

### Automated Security Tests

```typescript
// security.spec.ts
describe('Security Tests', () => {
  it('should not expose sensitive data in errors', () => {
    const error = new Error('Database connection failed');
    const sanitized = errorHandler.sanitize(error);

    expect(sanitized.message).not.toContain('password');
    expect(sanitized.message).not.toContain('connection string');
  });

  it('should sanitize XSS attempts', () => {
    const malicious = '<script>alert("xss")</script>';
    const sanitized = sanitizer.sanitize(SecurityContext.HTML, malicious);

    expect(sanitized).not.toContain('<script>');
  });
});
```

## Resources

- [Angular Security Guide](https://angular.io/guide/security)
- [OWASP Top 10](https://owasp.org/Top10/)
- [OWASP Angular Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Angular_Security_Cheat_Sheet.html)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
