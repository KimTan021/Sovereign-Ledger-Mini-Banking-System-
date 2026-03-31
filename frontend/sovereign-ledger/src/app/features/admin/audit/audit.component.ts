import { Component, ChangeDetectionStrategy, inject, signal, OnInit, effect, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AuditLogEntry, TransactionSearchFilters } from '../../../core/services/admin.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-audit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div #pageTop class="p-12 lg:p-16 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-screen-2xl mx-auto">
      <header class="space-y-1 block">
        <h1 class="text-3xl font-headline font-extrabold tracking-tighter text-primary">Global Transaction Desk</h1>
        <p class="text-on-surface-variant">Search, filter, and export transaction activity across the entire ledger.</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-8 gap-3">
        <input #searchBox type="text" (input)="setSearch(searchBox.value)" placeholder="Search user, account, detail"
                class="md:col-span-2 rounded-2xl bg-surface-container-low/50 px-4 py-4 focus:bg-white transition-colors border-none shadow-sm" />
        <input #userIdBox type="number" (input)="setUserId(userIdBox.value)" placeholder="User ID"
               class="rounded-2xl bg-surface-container-low/50 px-4 py-4 focus:bg-white transition-colors border-none shadow-sm" />
        <input #accountIdBox type="number" (input)="setAccountId(accountIdBox.value)" placeholder="Account ID"
               class="rounded-2xl bg-surface-container-low/50 px-4 py-4 focus:bg-white transition-colors border-none shadow-sm" />
        <input #minAmountBox type="number" (input)="setMinAmount(minAmountBox.value)" placeholder="Min Amount"
               class="rounded-2xl bg-surface-container-low/50 px-4 py-4 focus:bg-white transition-colors border-none shadow-sm font-bold text-primary" />
        <input #maxAmountBox type="number" (input)="setMaxAmount(maxAmountBox.value)" placeholder="Max Amount"
               class="rounded-2xl bg-surface-container-low/50 px-4 py-4 focus:bg-white transition-colors border-none shadow-sm font-bold text-primary" />
        <select #typeBox (change)="setType(typeBox.value)" class="rounded-2xl bg-surface-container-low/50 px-4 py-4 border-none shadow-sm font-bold">
          <option value="">All Types</option>
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>
        <select #statusBox (change)="setStatus(statusBox.value)" class="rounded-2xl bg-surface-container-low/50 px-4 py-4 border-none shadow-sm font-bold">
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="review required">Review Required</option>
          <option value="reviewed">Reviewed</option>
          <option value="escalated">Escalated</option>
        </select>
        <input #dateFromBox type="date" (change)="setDateFrom(dateFromBox.value)"
               class="rounded-2xl bg-surface-container-low/50 px-4 py-4 border-none shadow-sm" />
        <input #dateToBox type="date" (change)="setDateTo(dateToBox.value)"
               class="rounded-2xl bg-surface-container-low/50 px-4 py-4 border-none shadow-sm" />
        <button type="button" (click)="exportAudit()"
                class="rounded-2xl bg-primary text-on-primary px-4 py-4 font-black text-xs uppercase tracking-widest shadow-ambient hover:scale-[1.02] transition-transform">
          Export CSV
        </button>
      </div>

      @if (message()) {
        <div class="rounded-xl border border-tertiary-fixed/20 bg-tertiary-fixed/10 px-4 py-3 text-sm text-on-tertiary-fixed-variant">
          {{ message() }}
        </div>
      }
      
      <div class="bg-surface-container-low/30 rounded-2xl overflow-hidden shadow-ambient border-none text-on-surface">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr class="bg-surface-container-high/60 text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-black">
                <th class="px-6 py-5 first:rounded-l-2xl">Ledger Date</th>
                <th class="px-6 py-5">Originating Profile</th>
                <th class="px-6 py-5">Event Classification</th>
                <th class="px-6 py-5">Verification</th>
                <th class="px-6 py-5 text-right">Value Flux</th>
                <th class="px-6 py-5 last:rounded-r-2xl">Administrative Actions</th>
              </tr>
            </thead>
            <tbody class="space-y-0">
              @for (log of auditLogs(); track log.transactionId; let even = $even) {
                <tr class="transition-colors group {{ even ? 'bg-white' : 'bg-surface-container-low/40' }}">
                  <td class="px-6 py-5 whitespace-nowrap text-on-surface-variant font-mono text-xs first:rounded-l-2xl">
                    {{ log.timestamp | date:'medium' }}
                  </td>
                  <td class="px-6 py-5 whitespace-nowrap">
                    <p class="font-bold text-on-surface text-sm">{{ log.userName }}</p>
                    <p class="text-[10px] text-on-surface-variant font-mono uppercase tracking-tighter opacity-60">{{ log.accountNumber }} • User #{{ log.userId }}</p>
                  </td>
                  <td class="px-6 py-5">
                    <p class="font-bold text-sm" [class.text-error]="log.error" [class.text-primary]="!log.error">{{ log.title }}</p>
                    <p class="text-[11px] text-on-surface-variant mt-1 break-all opacity-80 italic">{{ log.detail }}</p>
                  </td>
                  <td class="px-6 py-5 whitespace-nowrap">
                    <span class="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
                          [class]="log.error ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-primary'">
                      {{ log.status }}
                    </span>
                  </td>
                  <td class="px-6 py-5 text-right font-headline font-bold text-lg tracking-tighter whitespace-nowrap" [class.text-error]="log.direction === 'DEBIT'" [class.text-on-tertiary-fixed-variant]="log.direction === 'CREDIT'">
                    {{ (log.direction === 'CREDIT' ? '+' : '-') }}{{ log.amount | currency:'PHP':'symbol':'1.0-0' }}
                  </td>
                  <td class="px-6 py-5 min-w-[320px] last:rounded-r-2xl">
                    @if (canReview(log)) {
                      <div class="space-y-2">
                        <input
                          [ngModel]="reviewNotes()[log.transactionId] || ''"
                          (ngModelChange)="setReviewNote(log.transactionId, $event)"
                          type="text"
                          class="w-full rounded-2xl bg-white px-4 py-3 border border-outline-variant/10 focus:border-primary/40 transition-colors text-sm"
                          placeholder="Review order" />
                        <div class="flex gap-2">
                          <button type="button"
                                  (click)="review(log, 'Reviewed')"
                                  class="rounded-2xl bg-surface-container-high/60 hover:bg-surface-container-highest px-3 py-2 font-black text-[10px] uppercase tracking-widest">
                            Verify
                          </button>
                          <button type="button"
                                  (click)="review(log, 'Escalated')"
                                  class="rounded-2xl bg-error text-on-error px-3 py-2 font-black text-[10px] uppercase tracking-widest shadow-sm">
                            Flag
                          </button>
                        </div>
                      </div>
                    } @else {
                      <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40 italic">Resolved</span>
                    }
                  </td>
                </tr>
                <tr class="h-1"></tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-6 py-10 text-center text-on-surface-variant">No transactions match the current filters.</td>
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
          (pageChange)="changePage($event)">
        </app-pagination>
      </div>
    </div>
  `
})
export class AuditComponent implements OnInit {
  private adminService = inject(AdminService);
  private readonly notificationService = inject(NotificationService);
  private readonly pageTop = viewChild<ElementRef<HTMLElement>>('pageTop');
  auditLogs = signal<AuditLogEntry[]>([]);
  filters = signal<TransactionSearchFilters>({});
  reviewNotes = signal<Record<number, string>>({});
  message = signal<string | null>(null);
  
  currentPage = signal(0);
  pageSize = signal(10);
  totalElements = signal(0);
  totalPages = signal(0);

  private readonly refreshOnDataChange = effect(() => {
    if (this.notificationService.dataVersion() === 0) {
      return;
    }
    this.loadAuditLogs(this.currentPage());
  });

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

  changePage(page: number): void {
    this.loadAuditLogs(page);
    requestAnimationFrame(() => {
      this.pageTop()?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
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

  canReview(log: AuditLogEntry): boolean {
    return ['failed', 'review required', 'escalated'].includes((log.status || '').toLowerCase());
  }

  setReviewNote(transactionId: number, note: string): void {
    this.reviewNotes.update(current => ({ ...current, [transactionId]: note }));
  }

  review(log: AuditLogEntry, status: 'Reviewed' | 'Escalated'): void {
    const note = this.reviewNotes()[log.transactionId] || '';
    this.adminService.reviewTransaction(log.transactionId, status, note).subscribe({
      next: () => {
        this.message.set(`Transaction #${log.transactionId} marked as ${status.toLowerCase()}.`);
        this.loadAuditLogs(this.currentPage());
      }
    });
  }

  private patchFilters(patch: Partial<TransactionSearchFilters>): void {
    this.filters.update(current => ({ ...current, ...patch }));
    this.loadAuditLogs(0);
  }
}
