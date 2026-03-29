import { Component, inject, signal, computed, ChangeDetectionStrategy, ViewChild, ElementRef, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AccountService, Account } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-transfer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavbarComponent, FooterComponent, ReactiveFormsModule, CurrencyPipe, CardComponent, CommonModule, BadgeComponent],
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
  submitted = signal(false);

  @ViewChild('recipientAccountInput') recipientAccountInput!: ElementRef<HTMLInputElement>;

  transferForm = this.fb.nonNullable.group({
    recipientAccount: ['', [Validators.required, Validators.pattern(/^[0-9 ]{10,24}$/)]],
    recipientName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80), Validators.pattern(/^[A-Za-z][A-Za-z\s.'-]*$/)]],
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
  transferBlockedMessage = computed(() => {
    const account = this.activeSourceAccount();
    if (!account) return 'Select a source account to continue.';
    if (account.status !== 'verified') {
      return `This ${account.type.toLowerCase()} account is currently ${account.status}. External transfers are blocked until it is verified again.`;
    }
    return null;
  });

  setActiveSource(acc: Account): void {
    this.activeSourceAccount.set(acc);
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.transferForm.markAllAsTouched();
    if (this.transferForm.valid) {
      const source = this.activeSourceAccount();
      if (!source) return;
      if (source.status !== 'verified') {
        this.activeError.set(this.transferBlockedMessage());
        return;
      }

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
          setTimeout(() => {
             this.showSuccess.set(false);
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
    this.submitted.set(false);
  }

  onAddNew(): void {
    this.transferForm.reset();
    this.submitted.set(false);
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

  badgeStatus(value: string): string {
    return (value || 'neutral').toLowerCase();
  }

  hasError(controlName: 'recipientAccount' | 'recipientName' | 'amount' | 'purpose'): boolean {
    const control = this.transferForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitted());
  }

  getErrorMessage(controlName: 'recipientAccount' | 'recipientName' | 'amount' | 'purpose'): string | null {
    const control = this.transferForm.get(controlName);
    if (!control || !this.hasError(controlName)) {
      return null;
    }

    if (control.hasError('required')) {
      return {
        recipientAccount: 'Recipient account number is required.',
        recipientName: 'Recipient name is required.',
        amount: 'Transfer amount is required.',
        purpose: 'Select a transfer purpose.'
      }[controlName];
    }
    if (control.hasError('pattern')) {
      return controlName === 'recipientAccount'
        ? 'Recipient account number must contain 10 to 18 digits.'
        : 'Recipient name may only contain letters, spaces, apostrophes, periods, and hyphens.';
    }
    if (control.hasError('minlength')) {
      return 'Recipient name must be at least 3 characters.';
    }
    if (control.hasError('maxlength')) {
      return 'Recipient name must not exceed 80 characters.';
    }
    if (control.hasError('min')) {
      return 'Transfer amount must be greater than zero.';
    }

    return null;
  }
}
