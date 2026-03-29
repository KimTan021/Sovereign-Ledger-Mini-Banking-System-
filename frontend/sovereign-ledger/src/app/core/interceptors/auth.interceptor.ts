import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if ((error.status === 401 || error.status === 403) && authService.isAuthenticated()) {
        authService.forceLogout('Your session is no longer authorized. Please sign in again.');
      }
      if (error.status === 401) {
        console.error('Unauthorized request:', req.url);
        console.error('Token present:', !!token);
        if (error.headers.has('WWW-Authenticate')) {
           console.error('WWW-Authenticate:', error.headers.get('WWW-Authenticate'));
        }
      }
      return throwError(() => error);
    })
  );
};
