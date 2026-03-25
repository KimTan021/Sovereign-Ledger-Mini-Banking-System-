import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService, UserRole } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  selectedRole = signal<UserRole>('customer');
  showPassword = signal(false);
  loginError = signal<string | null>(null);

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
    if (this.loginForm.invalid) return;

    const { identifier, password } = this.loginForm.getRawValue();
    const success = this.authService.login(identifier, password, this.selectedRole());

    if (success) {
      this.loginError.set(null);
      if (this.selectedRole() === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/customer/dashboard']);
      }
    } else {
      this.loginError.set('Invalid credentials. Please try again.');
    }
  }
}
