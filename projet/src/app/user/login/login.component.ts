import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../AuthGuard/authService';
import { IconComponent } from '../../core/icon.component';
import { errorMessage } from '../../core/models';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { ServiceUserService } from '../services/service-user.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, NavBarComponent, IconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private users = inject(ServiceUserService);
  private router = inject(Router);

  formulaire = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  pending = false;
  error: string | null = null;
  /** Set when the account exists but is not activated yet (HTTP 403). */
  notActivated = false;
  showPassword = false;

  submit(): void {
    if (this.pending) {
      return;
    }
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }
    this.pending = true;
    this.error = null;
    this.notActivated = false;
    const { email, password } = this.formulaire.getRawValue();

    this.users.loginUser({ email: email.trim(), password }).subscribe({
      next: session => {
        this.auth.setSession(session);
        this.pending = false;
        this.router.navigate([session.role === 'admin' ? '/admin' : '/author']);
      },
      error: err => {
        this.notActivated = err?.status === 403;
        this.error = errorMessage(err, 'Connexion impossible, réessayez.');
        this.pending = false;
      }
    });
  }
}
