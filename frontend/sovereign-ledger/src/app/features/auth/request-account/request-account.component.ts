import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { CustomerService } from '../../../core/services/customer.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

@Component({
  selector: 'app-request-account',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CardComponent],
  templateUrl: './request-account.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestAccountComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly customerService = inject(CustomerService);
  
  isLoggedIn = this.authService.isAuthenticated;
  pendingRequests = toSignal(this.isLoggedIn() ? this.customerService.getPendingRequests() : of([]), { initialValue: [] });
  activePendingRequestCount = computed(() =>
    this.pendingRequests().filter(request => request.requestStatus?.toLowerCase() === 'pending').length
  );

  showSuccess = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  submitted = signal(false);

  private readonly apiUrl = 'http://localhost:8080/pending-user';

  requestForm = this.fb.nonNullable.group({
    firstName: [''],
    middleName: [''],
    lastName: [''],
    userEmail: [''],
    password: [''],
    phone: [''],
    requestAccountType: ['savings', Validators.required],
    initialDeposit: [1000, [Validators.required, Validators.min(1000)]],
    terms: [false, Validators.requiredTrue]
  });

  constructor() {
    // Dynamically set validators based on log in state
    if (!this.isLoggedIn()) {
      this.requestForm.get('firstName')?.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(45), Validators.pattern(/^[A-Za-z][A-Za-z\s'-]*$/)]);
      this.requestForm.get('middleName')?.setValidators([Validators.maxLength(45), Validators.pattern(/^$|^[A-Za-z][A-Za-z\s'-]*$/)]);
      this.requestForm.get('lastName')?.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(45), Validators.pattern(/^[A-Za-z][A-Za-z\s'-]*$/)]);
      this.requestForm.get('userEmail')?.setValidators([Validators.required, Validators.email, Validators.maxLength(512)]);
      this.requestForm.get('password')?.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(72)]);
      this.requestForm.get('phone')?.setValidators([Validators.required, Validators.pattern('^\\+?[0-9 ]{10,15}$')]);
      this.requestForm.get('firstName')?.updateValueAndValidity();
      this.requestForm.get('middleName')?.updateValueAndValidity();
      this.requestForm.get('lastName')?.updateValueAndValidity();
      this.requestForm.get('userEmail')?.updateValueAndValidity();
      this.requestForm.get('password')?.updateValueAndValidity();
      this.requestForm.get('phone')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);
    this.requestForm.markAllAsTouched();
    this.enforceTermsAcceptance();
    if (this.requestForm.invalid || this.isSubmitting()) {
      this.errorMessage.set('Review the form and correct the highlighted fields before submitting.');
      return;
    }

    this.isSubmitting.set(true);
    const endpoint = this.isLoggedIn() ? '/request-account' : '/apply';
    const payload = this.isLoggedIn()
      ? {
          requestAccountType: this.requestForm.getRawValue().requestAccountType,
          initialDeposit: this.requestForm.getRawValue().initialDeposit
        }
      : this.requestForm.getRawValue();

    this.http.post(`${this.apiUrl}${endpoint}`, payload)
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showSuccess.set(true);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.applyServerFieldErrors(err.error?.fieldErrors);
          this.errorMessage.set(err.error?.message || 'Submission failed. Please check your data.');
        }
      });
  }

  resetForm(): void {
    this.showSuccess.set(false);
    this.submitted.set(false);
    this.requestForm.reset({
      requestAccountType: 'savings',
      initialDeposit: 1000,
      terms: false
    });
  }

  badgeStatus(value: string): string {
    return (value || 'pending').toLowerCase();
  }

  hasError(controlName: string): boolean {
    const control = this.requestForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitted());
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.requestForm.get(controlName);
    if (!control || !this.hasError(controlName)) {
      return null;
    }

    if (control.hasError('required')) {
      const requiredMessages: Record<string, string> = {
        firstName: 'First name is required.',
        lastName: 'Last name is required.',
        userEmail: 'Email address is required.',
        password: 'Password is required.',
        phone: 'Phone number is required.',
        requestAccountType: 'Select an account type.',
        initialDeposit: 'Initial deposit is required.',
        terms: 'You must accept the institutional terms.'
      };
      return requiredMessages[controlName] || 'This field is required.';
    }
    if (control.hasError('requiredTrue')) {
      return 'You must accept the institutional terms.';
    }
    if (control.hasError('email')) return 'Enter a valid email address.';
    if (control.hasError('server')) return control.getError('server');
    if (control.hasError('minlength')) {
      const minlengthMessages: Record<string, string> = {
        firstName: 'First name must be at least 2 characters.',
        lastName: 'Last name must be at least 2 characters.',
        password: 'Password must be at least 8 characters.'
      };
      return minlengthMessages[controlName] || 'This entry is too short.';
    }
    if (control.hasError('maxlength')) {
      const maxlengthMessages: Record<string, string> = {
        firstName: 'First name must not exceed 45 characters.',
        middleName: 'Middle name must not exceed 45 characters.',
        lastName: 'Last name must not exceed 45 characters.',
        userEmail: 'Email address must not exceed 512 characters.',
        password: 'Password must not exceed 72 characters.'
      };
      return maxlengthMessages[controlName] || 'This entry is too long.';
    }
    if (control.hasError('pattern')) {
      const patternMessages: Record<string, string> = {
        firstName: 'First name may only contain letters, spaces, apostrophes, and hyphens.',
        middleName: 'Middle name is optional, but if provided it may only contain letters, spaces, apostrophes, and hyphens.',
        lastName: 'Last name may only contain letters, spaces, apostrophes, and hyphens.',
        phone: 'Phone number must contain 10 to 15 digits and may include spaces or a leading plus sign.'
      };
      return patternMessages[controlName] || 'Invalid format.';
    }
    if (control.hasError('min')) return 'Initial deposit must be at least PHP 1,000.00.';

    return null;
  }

  private enforceTermsAcceptance(): void {
    const termsControl = this.requestForm.controls.terms;
    if (termsControl.value) {
      return;
    }

    const nextErrors = { ...(termsControl.errors ?? {}), requiredTrue: true };
    termsControl.setErrors(nextErrors);
  }

  private applyServerFieldErrors(fieldErrors: Record<string, string> | undefined): void {
    if (!fieldErrors) {
      return;
    }

    Object.entries(fieldErrors).forEach(([fieldName, message]) => {
      const control = this.requestForm.get(fieldName);
      if (!control) {
        return;
      }

      const nextErrors = { ...(control.errors ?? {}), server: message };
      control.setErrors(nextErrors);
      control.markAsTouched();
    });
  }
}
