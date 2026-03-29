import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService, UserRole } from '../../../core/services/auth.service';
import { AnimationOptions } from 'ngx-lottie';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReactiveFormsModule, RouterLink, NgOptimizedImage],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  isLoading = signal(false);
  lottieOptions: AnimationOptions = {
    path: '/animations/loading.json', // Placeholder path
  };
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  selectedRole = signal<UserRole>('customer');
  showPassword = signal(false);
  loginError = signal<string | null>(null);
  submitted = signal(false);

  loginForm = this.fb.nonNullable.group({
    identifier: ['', Validators.required],
    password: ['', Validators.required],
    remember: [false],
  });

  selectRole(role: UserRole): void {
    this.selectedRole.set(role);
    this.loginError.set(null);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.loginError.set(null);
    this.authService.forcedLogoutReason.set(null);
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { identifier, password } = this.loginForm.getRawValue();
    this.isLoading.set(true);
    this.authService.login(identifier, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.loginError.set(null);
        if (this.selectedRole() === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/customer/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const rawMessage = typeof err.error === 'string'
          ? err.error
          : (err.error?.message || 'Invalid credentials. Please try again.');
        this.loginError.set(
          rawMessage.toLowerCase().includes('suspend')
            ? 'This profile is suspended. Contact an administrator to restore access.'
            : rawMessage
        );
      }
    });
  }

  hasError(controlName: 'identifier' | 'password'): boolean {
    const control = this.loginForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitted());
  }

  getErrorMessage(controlName: 'identifier' | 'password'): string | null {
    const control = this.loginForm.get(controlName);
    if (!control || !this.hasError(controlName)) {
      return null;
    }

    if (control.hasError('required')) {
      return controlName === 'identifier'
        ? 'Email address is required.'
        : 'Password is required.';
    }

    return null;
  }
}
