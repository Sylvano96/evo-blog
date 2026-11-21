import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Session } from '../core/models';

const KEY = 'evoblog.session';

/**
 * Holds the JWT session. The token is only a convenience for the UI: every
 * permission is enforced again by the API.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  getSession(): Session | null {
    if (!this.browser) {
      return null;
    }
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) {
        return null;
      }
      const session = JSON.parse(raw) as Session;
      if (!session.token || Date.now() >= session.expiresAt) {
        this.logOut();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  setSession(session: Session): void {
    if (this.browser) {
      localStorage.setItem(KEY, JSON.stringify(session));
      // remove the keys used by the previous version of the app
      ['token', 'user_id', 'name'].forEach(k => localStorage.removeItem(k));
    }
  }

  isLoggedIn(): boolean {
    return this.getSession() !== null;
  }

  getToken(): string | null {
    return this.getSession()?.token ?? null;
  }

  getRole(): string | null {
    return this.getSession()?.role ?? null;
  }

  getAuthId(): number | null {
    return this.getSession()?.userId ?? null;
  }

  getName(): string | null {
    return this.getSession()?.name ?? null;
  }

  logOut(): void {
    if (this.browser) {
      localStorage.removeItem(KEY);
    }
  }
}
