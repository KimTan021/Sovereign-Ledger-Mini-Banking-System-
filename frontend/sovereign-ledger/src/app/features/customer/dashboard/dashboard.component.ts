import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AccountService } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CardComponent } from '../../../shared/components/card/card.component';
import { TransactionItemComponent } from '../../../shared/components/transaction-item/transaction-item.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    RouterLink,
    CurrencyPipe,
    CardComponent,
    TransactionItemComponent,
    BadgeComponent
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly accountService = inject(AccountService);
  private readonly transactionService = inject(TransactionService);
  private readonly authService = inject(AuthService);

  account = this.accountService.getCustomerAccount();
  recentTransactions = this.transactionService.getRecentTransactions(4);
  userName = this.authService.userName();
}
