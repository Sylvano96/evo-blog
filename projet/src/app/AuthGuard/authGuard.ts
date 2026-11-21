import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './authService';

/**
 * Usage: `canActivate: [AuthGuard], data: { roles: ['admin'] }`.
 * Without `roles`, any logged-in user is accepted.
 */
export const AuthGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const session = auth.getSession();
  if (!session) {
    return router.createUrlTree(['/login']);
  }
  const roles = route.data?.['roles'] as string[] | undefined;
  if (roles && !roles.includes(session.role)) {
    return router.createUrlTree([session.role === 'admin' ? '/admin' : '/author']);
  }
  return true;
};
