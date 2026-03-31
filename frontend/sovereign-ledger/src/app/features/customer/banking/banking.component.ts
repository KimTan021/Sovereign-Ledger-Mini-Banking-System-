import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { AccountService } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { OtpModalComponent } from '../../../shared/components/otp-modal/otp-modal.component';

@Component({
  selector: 'app-banking',  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, RouterLink, NavbarComponent, FooterComponent, CardComponent, BadgeComponent, OtpModalComponent],
  templateUrl: './banking.component.html',
})
export class BankingComponent {
  private readonly fb = inject(FormBuilder);
  private readonly accountService = inject(AccountService);
  private readonly transactionService = inject(TransactionService);

  accounts = toSignal(this.accountService.getCustomerAccounts(), { initialValue: [] });
  activeTab = signal<'deposit' | 'withdraw' | 'internal'>('deposit');
  actionError = signal<string | null>(null);
  actionSuccess = signal<string | null>(null);
  isSubmitting = signal(false);
  showOtpModal = signal(false);
  pendingSuccessMessage = signal<string | null>(null);
  depositSubmitted = signal(false);
  withdrawSubmitted = signal(false);
  internalSubmitted = signal(false);
 

  depositForm = this.fb.nonNullable.group({
    accountId: ['', Validators.required],
    amount: [1000, [Validators.required, Validators.min(0.01)]],
    description: ['Branch cash deposit', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
  });

  withdrawForm = this.fb.nonNullable.group({
    accountId: ['', Validators.required],
    amount: [500, [Validators.required, Validators.min(0.01)]],
    description: ['ATM cash withdrawal', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
  });

  internalTransferForm = this.fb.nonNullable.group({
    sourceAccountId: ['', Validators.required],
    receivingAccountId: ['', Validators.required],
    amount: [1000, [Validators.required, Validators.min(0.01)]],
    description: ['Internal portfolio rebalance', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
  });

  // Real-time form value tracking
  private depositValue = toSignal(this.depositForm.valueChanges, { initialValue: this.depositForm.getRawValue() });
  private withdrawValue = toSignal(this.withdrawForm.valueChanges, { initialValue: this.withdrawForm.getRawValue() });
  private internalValue = toSignal(this.internalTransferForm.valueChanges, { initialValue: this.internalTransferForm.getRawValue() });

  // Real-time constraints & balances
  isDepositLimitReached = computed(() => (this.depositValue().amount ?? 0) >= 99999999999999.99);

  selectedWithdrawAccount = computed(() => this.accounts().find(acc => acc.id === this.withdrawValue().accountId));
  withdrawBalance = computed(() => this.selectedWithdrawAccount()?.balance ?? 0);
  isWithdrawLimitReached = computed(() => (this.withdrawValue().amount ?? 0) >= 99999999999999.99);
  isWithdrawInsufficient = computed(() => (this.withdrawValue().amount ?? 0) > this.withdrawBalance());

  selectedInternalSource = computed(() => this.accounts().find(acc => acc.id === this.internalValue().sourceAccountId));
  internalSourceBalance = computed(() => this.selectedInternalSource()?.balance ?? 0);
  isInternalLimitReached = computed(() => (this.internalValue().amount ?? 0) >= 99999999999999.99);
  isInternalInsufficient = computed(() => (this.internalValue().amount ?? 0) > this.internalSourceBalance());

  private setDefaults = effect(() => {
    const accounts = this.accounts();
    if (accounts.length === 0) return;

    const firstAccountId = accounts[0].id;
    const secondAccountId = accounts[1]?.id ?? firstAccountId;

    if (!this.depositForm.getRawValue().accountId) {
      this.depositForm.patchValue({ accountId: firstAccountId });
    }

    if (!this.withdrawForm.getRawValue().accountId) {
      this.withdrawForm.patchValue({ accountId: firstAccountId });
    }

    const currentInternal = this.internalTransferForm.getRawValue();
    if (!currentInternal.sourceAccountId || !currentInternal.receivingAccountId) {
      this.internalTransferForm.patchValue({
        sourceAccountId: firstAccountId,
        receivingAccountId: secondAccountId,
      });
    }
  });

  activeTabTitle = computed(() => {
    switch (this.activeTab()) {
      case 'deposit':
        return 'Post a deposit';
      case 'withdraw':
        return 'Record a withdrawal';
      case 'internal':
        return 'Move money between your accounts';
    }
  });

  blockedAccounts = computed(() => this.accounts().filter(account => account.status !== 'verified'));

  selectTab(tab: 'deposit' | 'withdraw' | 'internal'): void {
    this.activeTab.set(tab);
    this.actionError.set(null);
    this.actionSuccess.set(null);
  }

  submitDeposit(): void {
    this.depositSubmitted.set(true);
    this.depositForm.markAllAsTouched();
    if (this.depositForm.invalid || this.isSubmitting()) return;

    const value = this.depositForm.getRawValue();
    const account = this.accounts().find(item => item.id === value.accountId);
    if (!this.isEligibleAccount(account?.id ?? null)) {
      this.actionError.set('Deposits are only available for verified accounts.');
      return;
    }
    this.runAction(
      this.transactionService.depositFunds({
        accountId: parseInt(value.accountId, 10),
        transAmount: value.amount,
        description: value.description,
      }),
      'Deposit posted successfully.',
      true
    );
  }

  submitWithdrawal(): void {
    this.withdrawSubmitted.set(true);
    this.withdrawForm.markAllAsTouched();
    if (this.withdrawForm.invalid || this.isSubmitting()) return;

    const value = this.withdrawForm.getRawValue();
    const account = this.accounts().find(item => item.id === value.accountId);
    if (!this.isEligibleAccount(account?.id ?? null)) {
      this.actionError.set('Withdrawals are only available for verified accounts.');
      return;
    }
    this.runAction(
      this.transactionService.withdrawFunds({
        accountId: parseInt(value.accountId, 10),
        transAmount: value.amount,
        description: value.description,
      }),
      'Withdrawal posted successfully.',
      true
    );
  }

  submitInternalTransfer(): void {
    this.internalSubmitted.set(true);
    this.internalTransferForm.markAllAsTouched();
    if (this.internalTransferForm.invalid || this.isSubmitting()) return;

    const value = this.internalTransferForm.getRawValue();
    if (value.sourceAccountId === value.receivingAccountId) {
      this.actionError.set('Select two different accounts for an internal transfer.');
      return;
    }
    if (!this.isEligibleAccount(value.sourceAccountId) || !this.isEligibleAccount(value.receivingAccountId)) {
      this.actionError.set('Internal transfers require both accounts to be verified.');
      return;
    }

    this.runAction(
      this.transactionService.transferBetweenOwnAccounts({
        sourceAccountId: parseInt(value.sourceAccountId, 10),
        receivingAccountId: parseInt(value.receivingAccountId, 10),
        transAmount: value.amount,
        logs: `Internal transfer from account ${value.sourceAccountId} to account ${value.receivingAccountId}`,
        transactionDescription: value.description,
      }),
      'Internal transfer completed.',
      true
    );
  }

  onAmountInput(event: Event, type: 'deposit' | 'withdraw' | 'internal'): void {
    const input = event.target as HTMLInputElement;
    let val = input.value;
    const maxVal = 99999999999999.99;
    let modified = false;

    // Physical capping
    if (parseFloat(val) > maxVal) {
      val = maxVal.toString();
      modified = true;
    }

    // Decimal precision cleanup (string-based to avoid cursor jumping)
    const parts = val.split('.');
    if (parts.length > 1 && parts[1].length > 2) {
      val = parts[0] + '.' + parts[1].substring(0, 2);
      modified = true;
    }

    if (modified) {
      input.value = val;
      const finalValue = parseFloat(val) || 0;
      const targetForm =
        type === 'deposit' ? this.depositForm :
        type === 'withdraw' ? this.withdrawForm :
        this.internalTransferForm;
      targetForm.patchValue({ amount: finalValue } as any);
    }
  }

  private runAction(request: Observable<unknown>, successMessage: string, isImmediate: boolean = false): void {
    this.isSubmitting.set(true);
    this.actionError.set(null);
    this.actionSuccess.set(null);

    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        if (isImmediate) {
          this.actionSuccess.set(successMessage);
          this.resetForms();
          setTimeout(() => this.actionSuccess.set(null), 5000);
        } else {
          this.pendingSuccessMessage.set(successMessage);
          this.showOtpModal.set(true);
        }
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        const backendMessage =
          typeof err.error === 'string'
            ? err.error
            : (err.error?.message || 'The request could not be completed.');
        this.actionError.set(backendMessage);
      }
    });
  }

  private resetForms(): void {
    // Reset forms
    this.depositForm.reset({ amount: 1000, description: 'Branch cash deposit' });
    this.withdrawForm.reset({ amount: 500, description: 'ATM cash withdrawal' });
    this.internalTransferForm.reset({ amount: 1000, description: 'Internal portfolio rebalance' });
    this.depositSubmitted.set(false);
    this.withdrawSubmitted.set(false);
    this.internalSubmitted.set(false);
  }

  onOtpVerified(): void {
    this.showOtpModal.set(false);
    this.actionSuccess.set(this.pendingSuccessMessage());
    this.pendingSuccessMessage.set(null);
    this.resetForms();
    setTimeout(() => this.actionSuccess.set(null), 5000);
  }

  onOtpCancelled(): void {
    this.showOtpModal.set(false);
    this.pendingSuccessMessage.set(null);
  }

  isEligibleAccount(accountId: string | null): boolean {
    if (!accountId) return false;
    return this.accounts().some(account => account.id === accountId && account.status === 'verified');
  }

  badgeStatus(value: string): string {
    return (value || 'neutral').toLowerCase();
  }

  hasDepositError(controlName: string): boolean {
    const control = this.depositForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.depositSubmitted());
  }

  hasWithdrawError(controlName: string): boolean {
    const control = this.withdrawForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.withdrawSubmitted());
  }

  hasInternalError(controlName: string): boolean {
    const control = this.internalTransferForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.internalSubmitted());
  }

  getFormError(form: 'deposit' | 'withdraw' | 'internal', controlName: string): string | null {
    const targetForm = form === 'deposit' ? this.depositForm : form === 'withdraw' ? this.withdrawForm : this.internalTransferForm;
    const submitted = form === 'deposit' ? this.depositSubmitted() : form === 'withdraw' ? this.withdrawSubmitted() : this.internalSubmitted();
    const control = (targetForm as any).get(controlName);
    if (!control || !control.invalid || !(control.touched || submitted)) return null;
    if (control.hasError('required')) return controlName.toLowerCase().includes('account') ? 'Select an account.' : 'This field is required.';
    if (control.hasError('min')) return 'Amount must be greater than zero.';
    if (control.hasError('minlength')) return 'Description must be at least 3 characters.';
    if (control.hasError('maxlength')) return 'Description must not exceed 150 characters.';
    return null;
  }
}
