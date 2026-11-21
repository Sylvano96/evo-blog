import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { errorMessage } from '../../core/models';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { ServiceUserService } from '../services/service-user.service';

const passwordsMatch: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const confirm = group.get('confirm')?.value;
  return password && confirm && password !== confirm ? { mismatch: true } : null;
};

@Component({
  selector: 'app-sign-up-user',
  imports: [ReactiveFormsModule, RouterLink, NavBarComponent, IconComponent],
  templateUrl: './sign-up-user.component.html',
  styleUrl: './sign-up-user.component.css'
})
export class SignUpUserComponent {

  private fb = inject(FormBuilder);
  private users = inject(ServiceUserService);
  private router = inject(Router);

  formulaire = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    lastName: ['', Validators.maxLength(60)],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    password: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(72)]],
    confirm: ['', Validators.required],
  }, { validators: passwordsMatch });

  pending = false;
  error: string | null = null;

  get c() {
    return this.formulaire.controls;
  }

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
    const { name, lastName, email, password } = this.formulaire.getRawValue();
    const cleanEmail = email.trim();

    this.users.createUser({ name: name.trim(), lastName: lastName.trim(), email: cleanEmail, password }).subscribe({
      next: () => {
        this.pending = false;
        this.router.navigate(['/user/validate'], { queryParams: { email: cleanEmail } });
      },
      error: err => {
        this.error = errorMessage(err, 'Inscription impossible, réessayez.');
        this.pending = false;
      }
    });
  }
}
