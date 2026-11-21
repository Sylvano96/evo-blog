import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../AuthGuard/authService';
import { IconComponent } from '../../core/icon.component';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
})
export class NavBarComponent implements OnInit {

  private auth = inject(AuthService);

  isMenuOpen = false;
  /** Link to the user's area when a session exists (read in the browser only). */
  spacePath: string | null = null;

  ngOnInit(): void {
    const role = this.auth.getRole();
    this.spacePath = role ? (role === 'admin' ? '/admin' : '/author') : null;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
