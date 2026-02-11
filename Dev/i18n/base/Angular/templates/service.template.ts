import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';

import { environment } from '@env/environment';

// ============================================
// Types
// ============================================

export interface {{Entity}} {
  id: string;
  // Add entity properties
}

export interface Create{{Entity}}Dto {
  // Add create DTO properties
}

export interface Update{{Entity}}Dto {
  // Add update DTO properties
}

interface {{Entity}}State {
  items: {{Entity}}[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: {{Entity}}State = {
  items: [],
  selectedId: null,
  loading: false,
  error: null
};

// ============================================
// API Service
// ============================================

@Injectable({ providedIn: 'root' })
export class {{Entity}}ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/{{entities}}`;

  getAll(): Observable<{{Entity}}[]> {
    return this.http.get<{{Entity}}[]>(this.baseUrl);
  }

  getById(id: string): Observable<{{Entity}}> {
    return this.http.get<{{Entity}}>(`${this.baseUrl}/${id}`);
  }

  create(dto: Create{{Entity}}Dto): Observable<{{Entity}}> {
    return this.http.post<{{Entity}}>(this.baseUrl, dto);
  }

  update(id: string, dto: Update{{Entity}}Dto): Observable<{{Entity}}> {
    return this.http.patch<{{Entity}}>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

// ============================================
// Store Service
// ============================================

@Injectable({ providedIn: 'root' })
export class {{Entity}}Store {
  // State
  private readonly state = signal<{{Entity}}State>(initialState);

  // Selectors
  readonly items = computed(() => this.state().items);
  readonly selectedId = computed(() => this.state().selectedId);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  readonly selectedItem = computed(() =>
    this.items().find(item => item.id === this.selectedId())
  );

  // Actions
  setItems(items: {{Entity}}[]): void {
    this.state.update(s => ({ ...s, items, loading: false, error: null }));
  }

  addItem(item: {{Entity}}): void {
    this.state.update(s => ({ ...s, items: [...s.items, item] }));
  }

  updateItem(updated: {{Entity}}): void {
    this.state.update(s => ({
      ...s,
      items: s.items.map(item => item.id === updated.id ? updated : item)
    }));
  }

  removeItem(id: string): void {
    this.state.update(s => ({
      ...s,
      items: s.items.filter(item => item.id !== id)
    }));
  }

  select(id: string | null): void {
    this.state.update(s => ({ ...s, selectedId: id }));
  }

  setLoading(loading: boolean): void {
    this.state.update(s => ({ ...s, loading }));
  }

  setError(error: string | null): void {
    this.state.update(s => ({ ...s, error, loading: false }));
  }

  reset(): void {
    this.state.set(initialState);
  }
}

// ============================================
// Facade Service
// ============================================

@Injectable({ providedIn: 'root' })
export class {{Entity}}Service {
  private readonly api = inject({{Entity}}ApiService);
  private readonly store = inject({{Entity}}Store);

  // Expose store selectors
  readonly items = this.store.items;
  readonly selectedItem = this.store.selectedItem;
  readonly loading = this.store.loading;
  readonly error = this.store.error;

  load(): void {
    this.store.setLoading(true);
    this.api.getAll().pipe(
      tap(items => this.store.setItems(items)),
      catchError(err => {
        this.store.setError(this.getErrorMessage(err));
        return throwError(() => err);
      })
    ).subscribe();
  }

  create(dto: Create{{Entity}}Dto): void {
    this.store.setLoading(true);
    this.api.create(dto).pipe(
      tap(item => {
        this.store.addItem(item);
        this.store.setLoading(false);
      }),
      catchError(err => {
        this.store.setError(this.getErrorMessage(err));
        return throwError(() => err);
      })
    ).subscribe();
  }

  update(id: string, dto: Update{{Entity}}Dto): void {
    this.store.setLoading(true);
    this.api.update(id, dto).pipe(
      tap(item => {
        this.store.updateItem(item);
        this.store.setLoading(false);
      }),
      catchError(err => {
        this.store.setError(this.getErrorMessage(err));
        return throwError(() => err);
      })
    ).subscribe();
  }

  delete(id: string): void {
    this.store.setLoading(true);
    this.api.delete(id).pipe(
      tap(() => {
        this.store.removeItem(id);
        this.store.setLoading(false);
      }),
      catchError(err => {
        this.store.setError(this.getErrorMessage(err));
        return throwError(() => err);
      })
    ).subscribe();
  }

  select(id: string | null): void {
    this.store.select(id);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return 'An unexpected error occurred';
  }
}
