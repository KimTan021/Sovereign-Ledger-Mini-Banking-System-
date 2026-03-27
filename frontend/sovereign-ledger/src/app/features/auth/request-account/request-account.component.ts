import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
  selector: 'app-request-account',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CardComponent],
  templateUrl: './request-account.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestAccountComponent {
  private readonly fb = inject(FormBuilder);
  
  showSuccess = signal(false);
  isSubmitting = signal(false);

  requestForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9+ ]{10,15}$')]],
    accountType: ['personal', Validators.required],
    initialDeposit: [5000, [Validators.required, Validators.min(1000)]],
    terms: [false, Validators.requiredTrue]
  });

  onSubmit(): void {
    if (this.requestForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      
      // Simulate API call
      setTimeout(() => {
        this.isSubmitting.set(false);
        this.showSuccess.set(true);
      }, 1500);
    }
  }

  resetForm(): void {
    this.showSuccess.set(false);
    this.requestForm.reset({
      accountType: 'personal',
      initialDeposit: 5000,
      terms: false
    });
  }
}
