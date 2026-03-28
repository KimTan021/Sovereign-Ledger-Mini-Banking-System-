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

@Component({
  selector: 'app-banking',  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, RouterLink, NavbarComponent, FooterComponent, CardComponent],
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

  depositForm = this.fb.nonNullable.group({
    accountId: ['', Validators.required],
    amount: [1000, [Validators.required, Validators.min(0.01)]],
    description: ['Branch cash deposit', Validators.required],
  });

  withdrawForm = this.fb.nonNullable.group({
    accountId: ['', Validators.required],
    amount: [500, [Validators.required, Validators.min(0.01)]],
    description: ['ATM cash withdrawal', Validators.required],
  });

  internalTransferForm = this.fb.nonNullable.group({
    sourceAccountId: ['', Validators.required],
    receivingAccountId: ['', Validators.required],
    amount: [1000, [Validators.required, Validators.min(0.01)]],
    description: ['Internal portfolio rebalance', Validators.required],
  });

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

  selectTab(tab: 'deposit' | 'withdraw' | 'internal'): void {
    this.activeTab.set(tab);
    this.actionError.set(null);
    this.actionSuccess.set(null);
  }

  submitDeposit(): void {
    if (this.depositForm.invalid || this.isSubmitting()) return;

    const value = this.depositForm.getRawValue();
    this.runAction(
      this.transactionService.depositFunds({
        accountId: parseInt(value.accountId, 10),
        transAmount: value.amount,
        description: value.description,
      }),
      'Deposit posted successfully.'
    );
  }

  submitWithdrawal(): void {
    if (this.withdrawForm.invalid || this.isSubmitting()) return;

    const value = this.withdrawForm.getRawValue();
    this.runAction(
      this.transactionService.withdrawFunds({
        accountId: parseInt(value.accountId, 10),
        transAmount: value.amount,
        description: value.description,
      }),
      'Withdrawal posted successfully.'
    );
  }

  submitInternalTransfer(): void {
    if (this.internalTransferForm.invalid || this.isSubmitting()) return;

    const value = this.internalTransferForm.getRawValue();
    if (value.sourceAccountId === value.receivingAccountId) {
      this.actionError.set('Select two different accounts for an internal transfer.');
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
      'Internal transfer completed.'
    );
  }

  private runAction(request: Observable<unknown>, successMessage: string): void {
    this.isSubmitting.set(true);
    this.actionError.set(null);
    this.actionSuccess.set(null);

    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.actionSuccess.set(successMessage);
        setTimeout(() => window.location.reload(), 1200);
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
}
