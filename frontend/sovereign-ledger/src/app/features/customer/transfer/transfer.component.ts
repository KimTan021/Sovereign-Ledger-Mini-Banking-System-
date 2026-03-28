import { Component, inject, signal, computed, ChangeDetectionStrategy, ViewChild, ElementRef, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AccountService, Account } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';
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
  private readonly transactionService = inject(TransactionService);

  accounts = toSignal(this.accountService.getCustomerAccounts(), { initialValue: [] });
  activeSourceAccount = signal<Account | null>(null);

  // Set initial source account
  private setInitialSource = effect(() => {
    const accs = this.accounts();
    if (accs.length > 0 && !this.activeSourceAccount()) {
      this.activeSourceAccount.set(accs[0]);
    }
  });

  recipients = toSignal(this.transactionService.getUniqueRecipients(), { initialValue: [] });
  showSuccess = signal(false);

  @ViewChild('recipientAccountInput') recipientAccountInput!: ElementRef<HTMLInputElement>;

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
  activeError = signal<string | null>(null);

  setActiveSource(acc: Account): void {
    this.activeSourceAccount.set(acc);
  }

  onSubmit(): void {
    if (this.transferForm.valid) {
      const source = this.activeSourceAccount();
      if (!source) return;

      this.activeError.set(null);

      const payload = {
        sourceAccountId: parseInt(source.id),
        targetAccountNumber: this.normalizeAccountNumber(this.transferForm.getRawValue().recipientAccount),
        transAmount: this.transferForm.getRawValue().amount,
        description: this.transferForm.getRawValue().purpose
      };

      this.transactionService.transferFunds(payload).subscribe({
        next: () => {
          this.showSuccess.set(true);
          this.transferForm.reset();
          // After success, it might be beneficial to trigger a reload of balances, but a standard timeout reload is okay for now.
          setTimeout(() => {
             this.showSuccess.set(false);
             window.location.reload();
          }, 3000);
        },
        error: (err) => {
          console.error(err);
          const backendMessage =
            typeof err.error === 'string'
              ? err.error
              : (err.error?.message || 'Verify the account number.');
          this.activeError.set('Transfer failed: ' + backendMessage);
        }
      });
    }
  }

  private normalizeAccountNumber(accountNumber: string): string {
    return accountNumber.replace(/[^a-zA-Z0-9]/g, '');
  }

  selectRecipient(recipient: any): void {
    this.transferForm.patchValue({
      recipientAccount: recipient.accountNumber || '',
      recipientName: recipient.name || ''
    });
  }

  onCancel(): void {
    this.transferForm.reset();
  }

  onAddNew(): void {
    this.transferForm.reset();
    setTimeout(() => {
      this.recipientAccountInput?.nativeElement?.focus();
    }, 0);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
