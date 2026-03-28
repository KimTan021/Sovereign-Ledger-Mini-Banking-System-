import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export type UserRole = 'customer' | 'admin';

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
  readonly userName = computed(() => this.currentUser()?.name ?? '');

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
        // Map backend roles ('user', 'admin') to frontend roles ('customer', 'admin')
        const frontendRole: UserRole = response.role === 'user' ? 'customer' : 'admin';
        
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
    this.currentUser.set(null);
    localStorage.removeItem('sovereign_session');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.currentUser()?.token ?? null;
  }
}
