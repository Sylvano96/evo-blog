import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CreateServiceService } from '../../Author/Services/create-service.service';
import { IconComponent } from '../../core/icon.component';
import { errorMessage } from '../../core/models';
import { NavBarComponent } from '../nav-bar/nav-bar.component';

@Component({
  selector: 'app-validate',
  imports: [ReactiveFormsModule, RouterLink, NavBarComponent, IconComponent],
  templateUrl: './validate.component.html',
  styleUrl: './validate.component.css'
})
export class ValidateComponent implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private service = inject(CreateServiceService);

  validate = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  pending = false;
  resending = false;
  activated = false;
  error: string | null = null;
  info: string | null = null;

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.validate.controls.email.setValue(email);
    }
  }

  submit(): void {
    if (this.pending) {
      return;
    }
    if (this.validate.invalid) {
      this.validate.markAllAsTouched();
      return;
    }
    this.pending = true;
    this.error = null;
    this.info = null;
    const { email, code } = this.validate.getRawValue();
    this.service.validation(email.trim(), code.trim()).subscribe({
      next: () => {
        this.activated = true;
        this.pending = false;
      },
      error: err => {
        this.error = errorMessage(err, 'Code invalide ou expiré.');
        this.pending = false;
      }
    });
  }

  resend(): void {
    const email = this.validate.controls.email;
    if (email.invalid) {
      email.markAsTouched();
      return;
    }
    this.resending = true;
    this.error = null;
    this.info = null;
    this.service.resendCode(email.value.trim()).subscribe({
      next: res => {
        this.info = res.message;
        this.resending = false;
      },
      error: err => {
        this.error = errorMessage(err, 'Impossible de renvoyer le code pour le moment.');
        this.resending = false;
      }
    });
  }
}
