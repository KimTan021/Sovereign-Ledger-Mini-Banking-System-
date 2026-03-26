import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AccountService } from '../../../core/services/account.service';
import { CommonModule, CurrencyPipe } from '@angular/common';

import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
  selector: 'app-transfer',
  standalone: true,
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

  get totalDebit(): number {
    const amount = this.transferForm.get('amount')?.value ?? 0;
    return amount;
  }

  get fee(): number {
    return 0;
  }

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
