import { Component, inject, ChangeDetectionStrategy, computed, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AccountService, Account } from '../../../core/services/account.service';
import { TransactionService, Transaction } from '../../../core/services/transaction.service';
import { AuthService } from '../../../core/services/auth.service';
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

  accounts = toSignal(this.accountService.getCustomerAccounts(), { initialValue: [] });
  activeAccount = signal<Account | null>(null);
  
  // Set the first account as active by default when accounts load
  private setInitialAccount = effect(() => {
    const accs = this.accounts();
    if (accs.length > 0 && !this.activeAccount()) {
      this.activeAccount.set(accs[0]);
    }
  });

  recentTransactions = toSignal(this.transactionService.getRecentTransactions(4), { initialValue: [] });
  allTransactions = toSignal(this.transactionService.getAllTransactions(), { initialValue: [] });
  userName = this.authService.userName();
  selectedTransaction = signal<Transaction | null>(null);

  aggregates = computed(() => this.transactionService.getAggregates(this.allTransactions()));
  
  aggregateBalance = computed(() => {
    return this.accounts().reduce((sum, acc) => sum + acc.balance, 0);
  });

  setActiveAccount(acc: Account): void {
    this.activeAccount.set(acc);
  }
}
