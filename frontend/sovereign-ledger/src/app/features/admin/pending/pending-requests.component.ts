import { Component, inject, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { AdminService, PendingUser } from '../../../core/services/admin.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-pending-requests',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CurrencyPipe, DatePipe, PaginationComponent],
  template: `
    <div class="p-8 lg:p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header class="space-y-1">
        <h1 class="text-3xl font-headline font-extrabold tracking-tighter text-primary">Pending User Requests</h1>
        <p class="text-on-surface-variant">Review and authorize new network participants</p>
      </header>

      <div class="bg-surface-container-lowest rounded-2xl shadow-ambient overflow-hidden border-none">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr class="bg-surface-container-high/40 text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-bold">
                <th class="px-8 py-5">Applicant</th>
                <th class="px-8 py-5">Contact Details</th>
                <th class="px-8 py-5">Account Intent</th>
                <th class="px-8 py-5 text-right">Initial Deposit</th>
                <th class="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of pendingUsers(); track user.userId) {
                <tr class="bg-white hover:bg-surface-container-low transition-colors group">
                  <td class="px-8 py-6">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/10">
                        {{ user.firstName[0] }}{{ user.lastName[0] }}
                      </div>
                      <div>
                        <p class="font-bold text-on-surface text-sm">{{ user.firstName }} {{ user.lastName }}</p>
                        <p class="text-[10px] text-outline font-medium">{{ user.requestTime | date:'MMM d, HH:mm' }}</p>
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
                    <span class="text-xs font-bold text-secondary bg-secondary/5 px-2.5 py-1 rounded-full border border-secondary/10">
                      {{ user.requestAccountType | titlecase }} Account
                    </span>
                  </td>
                  <td class="px-8 py-6 text-right font-headline font-bold text-primary text-lg tracking-tight">
                    {{ user.initialDeposit | currency:'PHP':'symbol':'1.2-2' }}
                  </td>
                  <td class="px-8 py-6 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button (click)="rejectRequest(user.userId)" [disabled]="isProcessing()[user.userId]"
                        class="p-2 text-error hover:bg-error-container/40 rounded-lg transition-colors disabled:opacity-50"
                        title="Reject Request">
                        <span class="material-symbols-outlined">block</span>
                      </button>
                      <button (click)="approveRequest(user.userId)" [disabled]="isProcessing()[user.userId]"
                        class="px-4 py-2 primary-gradient text-on-primary font-bold text-xs rounded-lg shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2">
                        @if (isProcessing()[user.userId]) {
                          <span class="material-symbols-outlined animate-spin text-xs">sync</span>
                        } @else {
                          Approve <span class="material-symbols-outlined text-xs">verified</span>
                        }
                      </button>
                    </div>
                  </td>
                </tr>
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
          (pageChange)="loadPendingUsers($event)">
        </app-pagination>
      </div>
    </div>
  `,
})
export class PendingRequestsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  
  pendingUsers = signal<PendingUser[]>([]);
  isProcessing = signal<{ [id: number]: boolean }>({});
  
  // Pagination state
  currentPage = signal(0);
  pageSize = signal(10);
  totalElements = signal(0);
  totalPages = signal(0);

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
