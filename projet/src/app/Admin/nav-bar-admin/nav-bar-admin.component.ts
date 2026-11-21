import { Component } from '@angular/core';
import { DashLink, DashSidebarComponent } from '../../core/dash-sidebar.component';

/** Admin area navigation. Page layout: `<div class="dash"><app-nav-bar-admin /><main class="dash-main">…</main></div>` */
@Component({
  selector: 'app-nav-bar-admin',
  imports: [DashSidebarComponent],
  template: `<app-dash-sidebar area="Administration" [links]="links" />`,
  styles: `:host { display: contents; }`,
})
export class NavBarAdminComponent {
  links: DashLink[] = [
    { label: 'Vue d\'ensemble', path: '/admin', icon: 'chart' },
    { label: 'Articles', path: '/listAllPost', icon: 'file' },
    { label: 'Auteurs', path: '/listAllUsers', icon: 'users' },
  ];
}
