import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export type UserRole = 'customer' | 'admin' | 'super_admin';

export interface User {
  identifier: string;
  name: string;
  role: UserRole;
  token?: string;
  userId?: number;
}

export interface LoginResponse {
  token: string;
  userId: number;
  userName: string;
  userEmail: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  
  private readonly apiUrl = 'http://localhost:8080/auth';

  private readonly currentUser = signal<User | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly userRole = computed(() => this.currentUser()?.role ?? null);
  readonly isSuperAdmin = computed(() => this.currentUser()?.role === 'super_admin');
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin' || this.isSuperAdmin());
  readonly userName = computed(() => this.currentUser()?.name ?? '');
  forcedLogoutReason = signal<string | null>(null);

  constructor() {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage(): void {
    const stored = localStorage.getItem('sovereign_session');
    if (stored) {
      try {
        const user = JSON.parse(stored) as User;
        this.currentUser.set(user);
      } catch (e) {
        this.logout();
      }
    }
  }

  login(identifier: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      userEmail: identifier,
      password: password
    }).pipe(
      tap(response => {
        // Map backend roles ('user', 'admin', 'super_admin') to frontend roles ('customer', 'admin', 'super_admin')
        let frontendRole: UserRole = 'customer';
        if (response.role === 'admin') frontendRole = 'admin';
        else if (response.role === 'super_admin') frontendRole = 'super_admin';
        
        const user: User = {
          identifier: response.userEmail,
          name: response.userName,
          role: frontendRole,
          token: response.token,
          userId: response.userId
        };
        
        this.currentUser.set(user);
        localStorage.setItem('sovereign_session', JSON.stringify(user));
      })
    );
  }

  logout(): void {
    this.forcedLogoutReason.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('sovereign_session');
    this.router.navigate(['/login']);
  }

  forceLogout(reason: string): void {
    this.forcedLogoutReason.set(reason);
    this.currentUser.set(null);
    localStorage.removeItem('sovereign_session');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.currentUser()?.token ?? null;
  }

  patchUser(patch: Partial<User>): void {
    const existing = this.currentUser();
    if (!existing) return;
    const updated = { ...existing, ...patch };
    this.currentUser.set(updated);
    localStorage.setItem('sovereign_session', JSON.stringify(updated));
  }
}
