import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AccountService } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-admin-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  templateUrl: './overview.component.html',
})
export class OverviewComponent {
  private readonly accountService = inject(AccountService);
  private readonly transactionService = inject(TransactionService);

  accounts = this.accountService.getAllAccounts();
  auditLog = this.transactionService.getAdminAuditLog();
}
