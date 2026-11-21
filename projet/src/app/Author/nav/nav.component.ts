import { Component } from '@angular/core';
import { DashLink, DashSidebarComponent } from '../../core/dash-sidebar.component';

/** Author area navigation. Page layout: `<div class="dash"><app-nav /><main class="dash-main">…</main></div>` */
@Component({
  selector: 'app-nav',
  imports: [DashSidebarComponent],
  template: `<app-dash-sidebar area="Espace auteur" [links]="links" />`,
  styles: `:host { display: contents; }`,
})
export class NavComponent {
  links: DashLink[] = [
    { label: 'Tableau de bord', path: '/author', icon: 'home' },
    { label: 'Mes articles', path: '/list', icon: 'file' },
    { label: 'Nouvel article', path: '/create', icon: 'plus' },
  ];
}
