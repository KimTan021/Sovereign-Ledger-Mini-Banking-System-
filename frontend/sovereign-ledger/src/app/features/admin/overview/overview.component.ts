import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { AccountService } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-admin-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CurrencyPipe, CardComponent, BadgeComponent],
  templateUrl: './overview.component.html',
})
export class OverviewComponent {
  private readonly accountService = inject(AccountService);
  private readonly transactionService = inject(TransactionService);

  accounts = this.accountService.getAllAccounts();
  auditLog = this.transactionService.getAdminAuditLog();
}
