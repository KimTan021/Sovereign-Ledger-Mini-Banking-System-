import { Component, ChangeDetectionStrategy, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminStats, AuditLogEntry, PendingUser } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-compliance',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header class="space-y-1 block">
        <h1 class="text-3xl font-headline font-extrabold tracking-tighter text-error">Compliance & Regulatory Hub</h1>
        <p class="text-on-surface-variant">Resolve flagged transactions, monitor pending KYC load, and export review queues.</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-surface-container border border-error/20 rounded-2xl p-6 shadow-sm">
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Pending KYC</p>
          <h2 class="text-4xl font-headline font-bold text-primary mt-3">{{ pendingCount() }}</h2>
          <p class="text-sm text-on-surface-variant mt-2">Requests awaiting approval before onboarding.</p>
        </div>

        <div class="bg-surface-container border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Flagged Queue</p>
          <h2 class="text-4xl font-headline font-bold mt-3" [class]="flaggedEntries().length > 0 ? 'text-error' : 'text-primary'">{{ flaggedEntries().length }}</h2>
          <p class="text-sm text-on-surface-variant mt-2">Transactions currently marked failed, escalated, or review required.</p>
        </div>

        <div class="bg-surface-container border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Risk Posture</p>
          <h2 class="text-4xl font-headline font-bold text-primary mt-3">{{ riskLevel() }}</h2>
          <p class="text-sm text-on-surface-variant mt-2">Derived from flagged events against current daily transaction volume.</p>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div class="text-sm text-on-surface-variant">
          {{ stats()?.dailyVolume || 0 }} transactions logged today. {{ reviewableEntries().length }} need compliance action.
        </div>
        <button type="button" (click)="exportReviewQueue()"
                class="rounded-xl bg-primary text-on-primary px-4 py-3 font-bold text-sm">
          Export Review Queue
        </button>
      </div>

      @if (message()) {
        <div class="rounded-xl border border-tertiary-fixed/20 bg-tertiary-fixed/10 px-4 py-3 text-sm text-on-tertiary-fixed-variant">
          {{ message() }}
        </div>
      }

      <div class="space-y-4">
        @for (entry of reviewableEntries(); track entry.transactionId) {
          <div class="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 space-y-4">
            <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div class="space-y-2 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                        [class]="entry.error ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-primary'">
                    {{ entry.status }}
                  </span>
                  <span class="text-xs text-on-surface-variant">{{ entry.timestamp | date:'medium' }}</span>
                </div>
                <h3 class="font-bold text-primary">{{ entry.title }}</h3>
                <p class="text-sm text-on-surface-variant break-all">{{ entry.detail }}</p>
                <p class="text-xs text-on-surface-variant">User {{ entry.userName }} • Account {{ entry.accountNumber }} • Tx #{{ entry.transactionId }}</p>
                @if (entry.reviewNote) {
                  <p class="text-xs text-secondary">Review note: {{ entry.reviewNote }}</p>
                }
              </div>
              <div class="text-right shrink-0">
                <p class="text-xs text-on-surface-variant uppercase tracking-widest">Value</p>
                <p class="text-xl font-headline font-bold text-on-surface">
                  {{ entry.type === 'credit' ? '+' : '-' }}{{ entry.amount | number:'1.2-2' }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-3">
              <input
                [ngModel]="reviewNotes()[entry.transactionId] || ''"
                (ngModelChange)="setReviewNote(entry.transactionId, $event)"
                type="text"
                class="rounded-xl bg-white px-4 py-3 border border-outline-variant/20"
                placeholder="Reviewer note or escalation reason" />
              <button type="button"
                      (click)="review(entry, 'Reviewed')"
                      class="rounded-xl border border-outline-variant/20 px-4 py-3 font-bold text-sm">
                Mark Reviewed
              </button>
              <button type="button"
                      (click)="review(entry, 'Escalated')"
                      class="rounded-xl bg-error text-on-error px-4 py-3 font-bold text-sm">
                Escalate
              </button>
            </div>
          </div>
        } @empty {
          <div class="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 text-center text-on-surface-variant">
            No flagged transactions currently require review.
          </div>
        }
      </div>
    </div>
  `
})
export class ComplianceComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly notificationService = inject(NotificationService);

  stats = signal<AdminStats | null>(null);
  pendingUsers = signal<PendingUser[]>([]);
  auditLogs = signal<AuditLogEntry[]>([]);
  reviewNotes = signal<Record<number, string>>({});
  message = signal<string | null>(null);

  pendingCount = computed(() => this.pendingUsers().length);
  flaggedEntries = computed(() => this.auditLogs().filter(entry => entry.error));
  reviewableEntries = computed(() => this.flaggedEntries().slice(0, 25));
  riskLevel = computed(() => {
    const flagged = this.flaggedEntries().length;
    if (flagged >= 5) return 'Elevated';
    if (flagged > 0 || this.pendingCount() > 5) return 'Guarded';
    return 'Low';
  });

  private readonly refreshOnDataChange = effect(() => {
    if (this.notificationService.dataVersion() === 0) {
      return;
    }
    this.reload();
  });

  ngOnInit(): void {
    this.reload();
  }

  review(entry: AuditLogEntry, status: 'Reviewed' | 'Escalated'): void {
    const note = this.reviewNotes()[entry.transactionId] || '';
    this.adminService.reviewTransaction(entry.transactionId, status, note).subscribe({
      next: () => {
        this.message.set(`Transaction #${entry.transactionId} marked as ${status.toLowerCase()}.`);
        this.reload();
      }
    });
  }

  setReviewNote(transactionId: number, note: string): void {
    this.reviewNotes.update(current => ({ ...current, [transactionId]: note }));
  }

  exportReviewQueue(): void {
    this.adminService.exportAuditCSV(this.reviewableEntries(), 'compliance-review-queue.csv');
  }

  private reload(): void {
    this.adminService.getSystemStats().subscribe(stats => this.stats.set(stats));
    this.adminService.getPendingUsers(0, 25).subscribe(response => this.pendingUsers.set(response.content));
    this.adminService.getFullAuditLogs(0, 100).subscribe(response => {
      this.auditLogs.set(response.content.filter(entry =>
        ['failed', 'review required', 'escalated'].includes(entry.status.toLowerCase())
      ));
    });
  }
}
