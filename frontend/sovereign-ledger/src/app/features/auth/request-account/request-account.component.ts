import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

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
  
  isLoggedIn = this.authService.isAuthenticated;

  showSuccess = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  private readonly apiUrl = 'http://localhost:8080/pending-user';

  requestForm = this.fb.nonNullable.group({
    firstName: [''],
    middleName: [''],
    lastName: [''],
    userEmail: [''],
    password: [''],
    phone: [''],
    requestAccountType: ['savings', Validators.required],
    initialDeposit: [5000, [Validators.required, Validators.min(1000)]],
    terms: [false, Validators.requiredTrue]
  });

  constructor() {
    // Dynamically set validators based on log in state
    if (!this.isLoggedIn()) {
      this.requestForm.get('firstName')?.setValidators([Validators.required, Validators.minLength(2)]);
      this.requestForm.get('lastName')?.setValidators([Validators.required, Validators.minLength(2)]);
      this.requestForm.get('userEmail')?.setValidators([Validators.required, Validators.email]);
      this.requestForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.requestForm.get('phone')?.setValidators([Validators.required, Validators.pattern('^[0-9+ ]{10,15}$')]);
    }
  }

  onSubmit(): void {
    if (this.requestForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);
      
      const endpoint = this.isLoggedIn() ? '/request-account' : '/apply';
      const payload = this.isLoggedIn() 
        ? {
            requestAccountType: this.requestForm.value.requestAccountType,
            initialDeposit: this.requestForm.value.initialDeposit
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
            this.errorMessage.set(err.error?.message || 'Submission failed. Please check your data.');
          }
        });
    }
  }

  resetForm(): void {
    this.showSuccess.set(false);
    this.requestForm.reset({
      requestAccountType: 'savings',
      initialDeposit: 5000,
      terms: false
    });
  }
}
