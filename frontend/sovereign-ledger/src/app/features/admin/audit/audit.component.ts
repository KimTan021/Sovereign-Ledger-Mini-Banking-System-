import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { AdminService, AuditLogEntry, TransactionSearchFilters } from '../../../core/services/admin.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-audit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, CurrencyPipe, PaginationComponent],
  template: `
    <div class="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header class="space-y-1 block">
        <h1 class="text-3xl font-headline font-extrabold tracking-tighter text-primary">Global Transaction Desk</h1>
        <p class="text-on-surface-variant">Search, filter, and export transaction activity across the entire ledger.</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-8 gap-3">
        <input #searchBox type="text" (input)="setSearch(searchBox.value)" placeholder="Search user, account, detail"
                class="md:col-span-2 rounded-xl bg-surface-container-lowest px-4 py-3 border border-outline-variant/20" />
        <input #userIdBox type="number" (input)="setUserId(userIdBox.value)" placeholder="User ID"
               class="rounded-xl bg-surface-container-lowest px-4 py-3 border border-outline-variant/20" />
        <input #accountIdBox type="number" (input)="setAccountId(accountIdBox.value)" placeholder="Account ID"
               class="rounded-xl bg-surface-container-lowest px-4 py-3 border border-outline-variant/20" />
        <input #minAmountBox type="number" (input)="setMinAmount(minAmountBox.value)" placeholder="Min Amount"
               class="rounded-xl bg-surface-container-lowest px-4 py-3 border border-outline-variant/20" />
        <input #maxAmountBox type="number" (input)="setMaxAmount(maxAmountBox.value)" placeholder="Max Amount"
               class="rounded-xl bg-surface-container-lowest px-4 py-3 border border-outline-variant/20" />
        <select #typeBox (change)="setType(typeBox.value)" class="rounded-xl bg-surface-container-lowest px-4 py-3 border border-outline-variant/20">
          <option value="">All Types</option>
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>
        <select #statusBox (change)="setStatus(statusBox.value)" class="rounded-xl bg-surface-container-lowest px-4 py-3 border border-outline-variant/20">
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="review required">Review Required</option>
          <option value="reviewed">Reviewed</option>
          <option value="escalated">Escalated</option>
        </select>
        <input #dateFromBox type="date" (change)="setDateFrom(dateFromBox.value)"
               class="rounded-xl bg-surface-container-lowest px-4 py-3 border border-outline-variant/20" />
        <input #dateToBox type="date" (change)="setDateTo(dateToBox.value)"
               class="rounded-xl bg-surface-container-lowest px-4 py-3 border border-outline-variant/20" />
        <button type="button" (click)="exportAudit()"
                class="rounded-xl bg-primary text-on-primary px-4 py-3 font-bold text-sm">
          Export CSV
        </button>
      </div>
      
      <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-surface-container text-on-surface-variant text-[10px] uppercase font-bold tracking-widest border-b border-outline-variant/20">
                <th class="px-6 py-4">Timestamp</th>
                <th class="px-6 py-4">User / Account</th>
                <th class="px-6 py-4">Event Description</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Value Flux</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/10">
              @for (log of auditLogs(); track log.transactionId) {
                <tr class="hover:bg-surface-container-lowest transition-colors group">
                  <td class="px-6 py-4 whitespace-nowrap text-on-surface-variant font-mono text-xs">
                    {{ log.timestamp | date:'medium' }}
                  </td>
                  <td class="px-6 py-4">
                    <p class="font-bold text-on-surface">{{ log.userName }}</p>
                    <p class="text-xs text-on-surface-variant font-mono">{{ log.accountNumber }} • User #{{ log.userId }}</p>
                  </td>
                  <td class="px-6 py-4">
                    <p class="font-bold" [class.text-error]="log.error" [class.text-on-surface]="!log.error">{{ log.title }}</p>
                    <p class="text-xs text-on-surface-variant mt-1 break-all">{{ log.detail }}</p>
                    @if (log.reviewNote) {
                      <p class="text-xs text-secondary mt-2">Review note: {{ log.reviewNote }}</p>
                    }
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                          [class]="log.error ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-primary'">
                      {{ log.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right font-headline font-bold">
                    {{ (log.type === 'credit' ? '+' : '-') }}{{ log.amount | currency:'PHP':'symbol':'1.2-2' }}
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-6 py-10 text-center text-on-surface-variant">No transactions match the current filters.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <app-pagination 
          [totalElements]="totalElements()" 
          [totalPages]="totalPages()" 
          [currentPage]="currentPage()" 
          [pageSize]="pageSize()"
          (pageChange)="loadAuditLogs($event)">
        </app-pagination>
      </div>
    </div>
  `
})
export class AuditComponent implements OnInit {
  private adminService = inject(AdminService);
  auditLogs = signal<AuditLogEntry[]>([]);
  filters = signal<TransactionSearchFilters>({});
  
  currentPage = signal(0);
  pageSize = signal(10);
  totalElements = signal(0);
  totalPages = signal(0);

  ngOnInit() {
    this.loadAuditLogs();
  }

  loadAuditLogs(page: number = 0) {
    this.adminService.searchTransactions(this.filters(), page, this.pageSize()).subscribe({
      next: (response) => {
        this.auditLogs.set(response.content);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.currentPage.set(response.number);
      }
    });
  }

  setSearch(search: string): void {
    this.patchFilters({ search });
  }

  setUserId(value: string): void {
    this.patchFilters({ userId: value ? parseInt(value, 10) : null });
  }

  setAccountId(value: string): void {
    this.patchFilters({ accountId: value ? parseInt(value, 10) : null });
  }

  setType(type: string): void {
    this.patchFilters({ type });
  }

  setMinAmount(value: string): void {
    this.patchFilters({ minAmount: value ? parseFloat(value) : null });
  }

  setMaxAmount(value: string): void {
    this.patchFilters({ maxAmount: value ? parseFloat(value) : null });
  }

  setStatus(status: string): void {
    this.patchFilters({ status });
  }

  setDateFrom(dateFrom: string): void {
    this.patchFilters({ dateFrom });
  }

  setDateTo(dateTo: string): void {
    this.patchFilters({ dateTo });
  }

  exportAudit(): void {
    this.adminService.exportAuditCSV(this.auditLogs(), `audit-report-page-${this.currentPage() + 1}.csv`);
  }

  private patchFilters(patch: Partial<TransactionSearchFilters>): void {
    this.filters.update(current => ({ ...current, ...patch }));
    this.loadAuditLogs(0);
  }
}
