import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../AuthGuard/authService';
import { IconComponent, IconName } from './icon.component';

export interface DashLink {
  label: string;
  path: string;
  icon: IconName;
}

/** Sidebar shared by the author and admin areas. */
@Component({
  selector: 'app-dash-sidebar',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <div class="mobile-bar">
      <a routerLink="/" class="brand">Evo<span>Blog</span></a>
      <button class="icon-btn" type="button" (click)="open = !open" [attr.aria-expanded]="open" aria-label="Menu">
        <app-icon [name]="open ? 'x' : 'menu'" />
      </button>
    </div>

    <aside class="sidebar" [class.open]="open">
      <a routerLink="/" class="brand desktop">Evo<span>Blog</span></a>
      <p class="area">{{ area }}</p>

      <nav>
        @for (link of links; track link.path) {
          <a [routerLink]="link.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
             (click)="open = false">
            <app-icon [name]="link.icon" />
            {{ link.label }}
          </a>
        }
        <a routerLink="/" (click)="open = false">
          <app-icon name="external" />
          Voir le blog
        </a>
      </nav>

      <div class="user">
        <span class="avatar">{{ initials }}</span>
        <span class="who">
          <strong>{{ name }}</strong>
          <small>{{ area }}</small>
        </span>
        <button class="icon-btn" type="button" (click)="logOut()" title="Se déconnecter" aria-label="Se déconnecter">
          <app-icon name="logout" />
        </button>
      </div>
    </aside>
  `,
  styles: `
    :host { display: contents; }
    .brand { font-family: var(--font-display); font-weight: 700; font-size: 1.3rem; color: var(--text); text-decoration: none; letter-spacing: -0.02em; }
    .brand span { color: var(--accent); }
    .sidebar {
      position: sticky; top: 0; height: 100vh; width: var(--sidebar-w); flex: none;
      display: flex; flex-direction: column; gap: 4px;
      padding: 24px 16px; background: var(--surface); border-right: 1px solid var(--border);
    }
    .area { margin: 4px 0 20px; padding-left: 2px; font-size: .78rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--text-3); }
    nav { display: flex; flex-direction: column; gap: 2px; }
    nav a {
      display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: var(--radius-sm);
      color: var(--text-2); font-weight: 500; font-size: .93rem; text-decoration: none;
    }
    nav a:hover { background: var(--surface-2); color: var(--text); }
    nav a.active { background: var(--accent-soft); color: var(--accent-text); }
    .user { margin-top: auto; display: flex; align-items: center; gap: 10px; padding: 12px 8px 0; border-top: 1px solid var(--border); }
    .avatar { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; flex: none; background: var(--accent-soft); color: var(--accent-text); font-weight: 700; font-size: .85rem; }
    .who { display: flex; flex-direction: column; min-width: 0; flex: 1; line-height: 1.25; }
    .who strong { font-size: .9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .who small { color: var(--text-3); font-size: .78rem; }
    .mobile-bar { display: none; }
    @media (max-width: 900px) {
      .mobile-bar {
        display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50;
        height: 56px; padding: 0 16px; background: var(--surface); border-bottom: 1px solid var(--border);
      }
      .brand.desktop { display: none; }
      .sidebar { display: none; position: fixed; top: 56px; left: 0; right: 0; height: auto; width: auto; z-index: 49; box-shadow: var(--shadow-lg); border-right: 0; border-bottom: 1px solid var(--border); }
      .sidebar.open { display: flex; }
    }
  `,
})
export class DashSidebarComponent {
  @Input({ required: true }) area!: string;
  @Input({ required: true }) links!: DashLink[];

  private auth = inject(AuthService);
  private router = inject(Router);

  open = false;
  name = this.auth.getName() ?? 'Utilisateur';
  initials = this.name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || '?';

  logOut() {
    this.auth.logOut();
    this.router.navigate(['/login']);
  }
}
