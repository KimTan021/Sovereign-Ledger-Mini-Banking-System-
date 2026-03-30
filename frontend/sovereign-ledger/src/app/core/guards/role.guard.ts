import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['expectedRole'] as UserRole;
  const currentRole = authService.userRole();
  const isAdmin = authService.isAdmin();

  if (currentRole === expectedRole || (expectedRole === 'admin' && isAdmin)) {
    return true;
  }

  // Redirect to the correct dashboard based on their actual role
  if (isAdmin) {
    router.navigate(['/admin']);
  } else if (currentRole === 'customer') {
    router.navigate(['/customer/dashboard']);
  } else {
    router.navigate(['/login']);
  }
  return false;
};
