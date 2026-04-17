# Template: HTTP Interceptor

> **Pattern** - Interceptor pour modifier les requêtes/réponses HTTP
> Référence: `.claude/rules/11-security.md`, `.claude/rules/04-solid-principles.md`

## Principe

Les interceptors interceptent les requêtes/réponses HTTP pour ajouter des headers, gérer l'auth, logger, etc.

---

## Template Angular

```typescript
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/**
 * Interceptor: [NomInterceptor]
 *
 * Responsabilité: [Description de la responsabilité unique]
 *
 * Use cases:
 * - [Use case 1]
 * - [Use case 2]
 */
@Injectable()
export class [NomInterceptor] implements HttpInterceptor {
  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // 1. Modifier la requête
    const modifiedReq = req.clone({
      setHeaders: {
        '[Header-Name]': '[header-value]',
      },
    });

    // 2. Passer au handler suivant
    return next.handle(modifiedReq).pipe(
      tap((event) => {
        // Traiter la réponse
      }),
      catchError((error: HttpErrorResponse) => {
        // Gérer les erreurs
        return throwError(() => error);
      })
    );
  }
}
```

### Exemple: AuthInterceptor

```typescript
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
```

---

## Template Axios (React/Vue)

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Interceptor: [NomInterceptor]
 *
 * Responsabilité: [Description de la responsabilité unique]
 *
 * Use cases:
 * - [Use case 1]
 * - [Use case 2]
 */
export const setupInterceptors = (axiosInstance: AxiosInstance): void => {
  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      // Modifier la requête
      config.headers['X-Custom-Header'] = 'value';
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Traiter la réponse
      return response;
    },
    (error) => {
      // Gérer les erreurs
      return Promise.reject(error);
    }
  );
};
```

### Exemple: Auth + Retry Interceptor

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

const MAX_RETRIES = 3;

export const setupAuthInterceptor = (
  axiosInstance: AxiosInstance
): void => {
  // Request: ajouter token
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response: refresh token + retry
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await refreshToken();
          localStorage.setItem('token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch {
          window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    }
  );
};

async function refreshToken(): Promise<string> {
  const response = await axios.post('/auth/refresh');
  return response.data.token;
}
```
