import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

export type UserRole = 'customer' | 'admin';

export interface User {
  identifier: string;
  name: string;
  role: UserRole;
}

const MOCK_USERS = [
  { identifier: 'SL-8829410', password: 'customer123', name: 'Adrian Sovereign', role: 'customer' as UserRole },
  { identifier: 'admin@sovereign.com', password: 'admin123', name: 'System Oversight', role: 'admin' as UserRole },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  private readonly currentUser = signal<User | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly userRole = computed(() => this.currentUser()?.role ?? null);
  readonly userName = computed(() => this.currentUser()?.name ?? '');

  login(identifier: string, password: string, role: UserRole): boolean {
    const found = MOCK_USERS.find(
      u => u.identifier.toLowerCase() === identifier.toLowerCase()
        && u.password === password
        && u.role === role
    );

    if (found) {
      this.currentUser.set({ identifier: found.identifier, name: found.name, role: found.role });
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
