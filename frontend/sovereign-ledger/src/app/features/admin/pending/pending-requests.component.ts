import { Component, inject, ChangeDetectionStrategy, OnInit, signal, effect, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, PendingUser } from '../../../core/services/admin.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-pending-requests',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PaginationComponent],
  template: `
    <div #pageTop class="p-12 lg:p-16 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-screen-2xl mx-auto">
      <header class="space-y-1">
        <h1 class="text-3xl font-headline font-extrabold tracking-tighter text-primary">Pending User Requests</h1>
        <p class="text-on-surface-variant">Review and authorize new network participants</p>
      </header>

      <div class="flex justify-end">
        <button type="button"
                (click)="exportPendingUsers()"
                class="px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-sm hover:translate-y-[-1px] transition-transform">
          Export Pending CSV
        </button>
      </div>

      <div class="bg-surface-container-low/30 rounded-2xl shadow-ambient overflow-hidden border-none text-on-surface">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr class="bg-surface-container-high/60 text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-bold">
                <th class="px-8 py-5 first:rounded-l-2xl">Applicant</th>
                <th class="px-8 py-5">Contact Details</th>
                <th class="px-8 py-5">Account Intent</th>
                <th class="px-8 py-5 text-right">Initial Deposit</th>
                <th class="px-8 py-5 text-right last:rounded-r-2xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of pendingUsers(); track user.userId; let even = $even) {
                <tr class="transition-colors group {{ even ? 'bg-white' : 'bg-surface-container-low/40' }}">
                  <td class="px-8 py-6 first:rounded-l-2xl">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/5 group-hover:scale-110 transition-transform">
                        {{ user.firstName[0] }}{{ user.lastName[0] }}
                      </div>
                      <div>
                        <p class="font-bold text-on-surface text-sm">{{ user.firstName }} {{ user.lastName }}</p>
                        <p class="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold opacity-60">{{ user.requestTime | date:'MMM d, HH:mm' }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-6">
                    <div class="space-y-0.5">
                      <p class="text-xs text-on-surface flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm opacity-60">mail</span>
                        {{ user.userEmail }}
                      </p>
                      <p class="text-xs text-on-surface-variant flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm opacity-60">phone</span>
                        {{ user.phone || 'N/A' }}
                      </p>
                    </div>
                  </td>
                  <td class="px-8 py-6">
                    <span class="text-[10px] font-black text-secondary px-3 py-1.5 rounded-full bg-secondary/5 uppercase tracking-widest">
                      {{ user.requestAccountType | titlecase }}
                    </span>
                  </td>
                  <td class="px-8 py-6 text-right font-headline font-bold text-primary text-xl tracking-tighter">
                    {{ user.initialDeposit | currency:'PHP':'symbol':'1.0-0' }}
                  </td>
                  <td class="px-8 py-6 text-right last:rounded-r-2xl">
                    <div class="flex items-center justify-end gap-3">
                      <button (click)="rejectRequest(user.userId)" [disabled]="isProcessing()[user.userId]"
                        class="p-2 text-error hover:bg-error-container/40 rounded-xl transition-all disabled:opacity-50"
                        title="Reject Request">
                        <span class="material-symbols-outlined text-base">block</span>
                      </button>
                      <button (click)="approveRequest(user.userId)" [disabled]="isProcessing()[user.userId]"
                        class="px-5 py-2.5 bg-primary text-on-primary font-black text-[10px] uppercase tracking-[0.15em] rounded-2xl shadow-ambient hover:scale-[1.05] active:scale-[0.95] transition-all disabled:opacity-50 flex items-center gap-2">
                        @if (isProcessing()[user.userId]) {
                          <span class="material-symbols-outlined animate-spin text-xs">sync</span>
                        } @else {
                          Approve <span class="material-symbols-outlined text-xs">verified</span>
                        }
                      </button>
                    </div>
                  </td>
                </tr>
                <tr class="h-1"></tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-8 py-12 text-center text-on-surface-variant italic">
                    All clear. No pending registration requests at this time.
                  </td>
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
  `,
})
export class PendingRequestsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly notificationService = inject(NotificationService);
  private readonly pageTop = viewChild<ElementRef<HTMLElement>>('pageTop');
  
  pendingUsers = signal<PendingUser[]>([]);
  isProcessing = signal<{ [id: number]: boolean }>({});
  
  // Pagination state
  currentPage = signal(0);
  pageSize = signal(10);
  totalElements = signal(0);
  totalPages = signal(0);

  private readonly refreshOnDataChange = effect(() => {
    if (this.notificationService.dataVersion() === 0) {
      return;
    }
    this.loadPendingUsers(this.currentPage());
  });

  ngOnInit(): void {
    this.loadPendingUsers();
  }

  loadPendingUsers(page: number = 0): void {
    this.adminService.getPendingUsers(page, this.pageSize()).subscribe({
      next: (response) => {
        this.pendingUsers.set(response.content);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.currentPage.set(response.number);
      },
      error: (err) => console.error('Failed to load pending users', err)
    });
  }

  changePage(page: number): void {
    this.loadPendingUsers(page);
    requestAnimationFrame(() => {
      this.pageTop()?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }

  exportPendingUsers(): void {
    const exportSize = Math.max(this.totalElements(), this.pageSize(), 100);
    this.adminService.getPendingUsers(0, exportSize).subscribe({
      next: response => this.adminService.exportPendingUsersCSV(
        response.content,
        `pending-requests-${new Date().toISOString().split('T')[0]}.csv`
      )
    });
  }

  approveRequest(id: number): void {
    this.setProcessing(id, true);
    this.adminService.approveUser(id).subscribe({
      next: () => {
        this.setProcessing(id, false);
        this.loadPendingUsers(this.currentPage());
      },
      error: (err) => {
        console.error('Failed to approve user', err);
        this.setProcessing(id, false);
      }
    });
  }

  rejectRequest(id: number): void {
    this.setProcessing(id, true);
    this.adminService.rejectUser(id).subscribe({
      next: () => {
        this.setProcessing(id, false);
        this.loadPendingUsers(this.currentPage());
      },
      error: (err) => {
        console.error('Failed to reject user', err);
        this.setProcessing(id, false);
      }
    });
  }

  private setProcessing(id: number, status: boolean): void {
    this.isProcessing.update(prev => ({ ...prev, [id]: status }));
  }
}
