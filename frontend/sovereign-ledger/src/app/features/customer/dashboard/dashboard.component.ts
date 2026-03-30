import { Component, inject, ChangeDetectionStrategy, computed, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AccountService, Account } from '../../../core/services/account.service';
import { TransactionService, Transaction } from '../../../core/services/transaction.service';
import { AuthService } from '../../../core/services/auth.service';
import { CustomerService } from '../../../core/services/customer.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CardComponent } from '../../../shared/components/card/card.component';
import { TransactionItemComponent } from '../../../shared/components/transaction-item/transaction-item.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-customer-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    RouterLink,
    CurrencyPipe,
    CardComponent,
    TransactionItemComponent,
    BadgeComponent,
    ModalComponent
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly accountService = inject(AccountService);
  private readonly transactionService = inject(TransactionService);
  private readonly authService = inject(AuthService);
  private readonly customerService = inject(CustomerService);

  accounts = toSignal(this.accountService.getCustomerAccounts(), { initialValue: [] });
  activeAccount = signal<Account | null>(null);
  
  // Keep the selected account in sync with live account refreshes.
  private syncActiveAccount = effect(() => {
    const accs = this.accounts();
    const current = this.activeAccount();

    if (accs.length === 0) {
      this.activeAccount.set(null);
      return;
    }

    if (!current) {
      this.activeAccount.set(accs[0]);
      return;
    }

    const updated = accs.find(account => account.id === current.id);
    this.activeAccount.set(updated ?? accs[0]);
  });

  recentTransactions = toSignal(this.transactionService.getRecentTransactions(4), { initialValue: [] });
  allTransactions = toSignal(this.transactionService.getAllTransactions(), { initialValue: [] });
  pendingRequests = toSignal(this.customerService.getPendingRequests(), { initialValue: [] });
  activePendingRequestCount = computed(() =>
    this.pendingRequests().filter(request => request.requestStatus?.toLowerCase() === 'pending').length
  );
  userName = this.authService.userName;
  selectedTransaction = signal<Transaction | null>(null);

  aggregates = computed(() => this.transactionService.getAggregates(this.allTransactions()));
  
  aggregateBalance = computed(() => {
    return this.accounts().reduce((sum, acc) => sum + acc.balance, 0);
  });

  setActiveAccount(acc: Account): void {
    this.activeAccount.set(acc);
  }

  badgeStatus(value: string): string {
    return (value || 'neutral').toLowerCase();
  }

  canTransact(account: Account | null): boolean {
    return !!account && account.status === 'verified';
  }

  getAccountStatusMessage(account: Account | null): string | null {
    if (!account || account.status === 'verified') {
      return null;
    }

    if (account.status === 'frozen') {
      return 'This account is currently frozen. Transfers, withdrawals, and deposits are unavailable until an administrator restores access.';
    }

    if (account.status === 'closed') {
      return 'This account is closed. It can no longer be used for transfers, withdrawals, or deposits.';
    }

    return `This account is currently ${account.status}. Transfers, withdrawals, and deposits remain limited until the account returns to verified status.`;
  }
}
