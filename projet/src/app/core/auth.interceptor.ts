import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../AuthGuard/authService';
import { API_BASE_URL } from './api.config';

/** Adds the JWT to API calls only (never to third-party URLs) and handles expired sessions. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();
  const isApi = req.url.startsWith(`${inject(API_BASE_URL)}/api/`);

  const request = token && isApi
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isApi && error.status === 401 && token) {
        auth.logOut();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
