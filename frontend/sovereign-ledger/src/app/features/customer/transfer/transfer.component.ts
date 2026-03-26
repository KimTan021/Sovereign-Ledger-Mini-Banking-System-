import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AccountService } from '../../../core/services/account.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
  selector: 'app-transfer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavbarComponent, FooterComponent, ReactiveFormsModule, CurrencyPipe, CardComponent, CommonModule],
  templateUrl: './transfer.component.html',
})
export class TransferComponent {
  private readonly fb = inject(FormBuilder);
  private readonly accountService = inject(AccountService);

  account = this.accountService.getCustomerAccount();
  recipients = this.accountService.getRecipients();
  showSuccess = signal(false);

  transferForm = this.fb.nonNullable.group({
    recipientAccount: ['', Validators.required],
    recipientName: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    purpose: ['', Validators.required],
  });

  // Convert form value to a signal for reactive dependencies
  private formValue = toSignal(this.transferForm.valueChanges, {
    initialValue: this.transferForm.getRawValue()
  });

  totalDebit = computed(() => this.formValue().amount ?? 0);
  fee = computed(() => 0); // Fixed fee for now

  onSubmit(): void {
    if (this.transferForm.valid) {
      this.showSuccess.set(true);
      this.transferForm.reset();
      setTimeout(() => this.showSuccess.set(false), 4000);
    }
  }

  onCancel(): void {
    this.transferForm.reset();
  }
}
