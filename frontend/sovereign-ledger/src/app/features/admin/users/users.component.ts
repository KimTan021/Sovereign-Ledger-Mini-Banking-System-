import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminAccount, AdminService, AdminUserDetail, PasswordResetResponse, SystemUser } from '../../../core/services/admin.service';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-admin-users',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, BadgeComponent, PaginationComponent, ModalComponent],
  template: `
    <div class="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header class="space-y-1 block">
        <h1 class="text-3xl font-headline font-extrabold tracking-tighter text-primary">Global Directory</h1>
        <p class="text-on-surface-variant">Manage user access, profile data, account controls, and administrative adjustments.</p>
      </header>
      
      <div class="bg-surface-container-lowest rounded-xl overflow-hidden shadow-ambient">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-separate" style="border-spacing: 0 4px;">
            <thead>
              <tr class="bg-surface-container flex-row text-on-surface-variant text-[10px] uppercase tracking-[0.15em] font-bold">
                <th class="px-6 py-4">Entity Identity</th>
                <th class="px-6 py-4">Primary Account</th>
                <th class="px-6 py-4">Email</th>
                <th class="px-6 py-4">Access</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="space-y-1">
              @for (user of users(); track user.userId) {
                <tr class="bg-surface hover:bg-surface-container transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-bold text-xs">
                        {{ user.firstName[0] }}{{ user.lastName[0] }}
                      </div>
                      <div>
                        <p class="font-bold text-on-surface">{{ user.firstName }} {{ user.middleName ? user.middleName[0] + '.' : '' }} {{ user.lastName }}</p>
                        <p class="text-xs text-on-surface-variant">{{ user.accountCount }} linked account{{ user.accountCount === 1 ? '' : 's' }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 font-mono text-primary font-bold tracking-wider text-sm">{{ user.accountNumber || 'N/A' }}</td>
                  <td class="px-6 py-4 text-on-surface-variant text-sm">{{ user.userEmail }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <app-badge [status]="user.userStatus === 'ACTIVE' ? 'completed' : 'declined'">
                        {{ user.userStatus | titlecase }}
                      </app-badge>
                      <app-badge [status]="user.role === 'admin' ? 'verified' : 'completed'">
                        {{ user.role | titlecase }}
                      </app-badge>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button type="button"
                              (click)="toggleUserStatus(user)"
                              class="px-3 py-2 rounded-lg text-xs font-bold border border-outline-variant/20 hover:border-primary/40">
                        {{ user.userStatus === 'ACTIVE' ? 'Suspend' : 'Reactivate' }}
                      </button>
                      <button type="button"
                              (click)="openUser(user.userId)"
                              class="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-sm">
                        Manage
                      </button>
                    </div>
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
          (pageChange)="loadUsers($event)">
        </app-pagination>
      </div>

      @if (users().length === 0) {
        <div class="text-center py-12 text-on-surface-variant">
          <span class="material-symbols-outlined text-5xl mb-4 block opacity-30">group_off</span>
          <p class="font-bold">No users found</p>
        </div>
      }
    </div>

    @if (selectedUser(); as detail) {
      <app-modal [title]="'Manage ' + detail.firstName + ' ' + detail.lastName" (close)="closeUser()">
        <div class="space-y-8">
          @if (actionMessage()) {
            <div class="rounded-xl border border-tertiary-fixed/20 bg-tertiary-fixed/10 px-4 py-3 text-sm text-on-tertiary-fixed-variant">
              {{ actionMessage() }}
            </div>
          }

          @if (errorMessage()) {
            <div class="rounded-xl border border-error/20 bg-error-container/20 px-4 py-3 text-sm text-on-error-container">
              {{ errorMessage() }}
            </div>
          }

          <section class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-headline font-bold text-primary">User Controls</h3>
              <div class="flex items-center gap-2">
                <app-badge [status]="detail.userStatus === 'ACTIVE' ? 'completed' : 'declined'">{{ detail.userStatus }}</app-badge>
                <app-badge [status]="detail.role === 'admin' ? 'verified' : 'completed'">{{ detail.role }}</app-badge>
              </div>
            </div>

            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input formControlName="firstName" type="text" class="rounded-xl bg-surface-container-highest px-4 py-3" placeholder="First name" />
              <input formControlName="middleName" type="text" class="rounded-xl bg-surface-container-highest px-4 py-3" placeholder="Middle name" />
              <input formControlName="lastName" type="text" class="rounded-xl bg-surface-container-highest px-4 py-3" placeholder="Last name" />
              <input formControlName="phone" type="text" class="rounded-xl bg-surface-container-highest px-4 py-3" placeholder="Phone" />
              <input formControlName="userEmail" type="email" class="md:col-span-2 rounded-xl bg-surface-container-highest px-4 py-3" placeholder="Email" />
              <div class="md:col-span-2 flex flex-wrap gap-3">
                <button type="submit" class="px-5 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm">Save Profile</button>
                <button type="button" (click)="toggleDetailUserStatus(detail)" class="px-5 py-3 rounded-xl border border-outline-variant/20 font-bold text-sm">
                  {{ detail.userStatus === 'ACTIVE' ? 'Suspend User' : 'Reactivate User' }}
                </button>
                <select [value]="detail.role" (change)="changeRole($any($event.target).value)" class="px-4 py-3 rounded-xl bg-surface-container-highest text-sm font-bold">
                  <option value="user">Customer Role</option>
                  <option value="admin">Admin Role</option>
                </select>
                <button type="button" (click)="resetPassword()" class="px-5 py-3 rounded-xl border border-outline-variant/20 font-bold text-sm">
                  Reset Password
                </button>
              </div>
            </form>

            @if (passwordReset(); as passwordInfo) {
              <div class="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
                <p class="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Temporary Password</p>
                <p class="mt-2 font-mono text-primary font-bold">{{ passwordInfo.temporaryPassword }}</p>
              </div>
            }
          </section>

          <section class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-headline font-bold text-primary">Accounts and Controls</h3>
              <p class="text-sm text-on-surface-variant">Total balance: {{ detail.totalBalance | currency:'PHP':'symbol':'1.2-2' }}</p>
            </div>

            <div class="space-y-4">
              @for (account of detail.accounts; track account.accountId) {
                <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5 space-y-4">
                  <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <p class="text-sm font-bold text-primary">Sovereign {{ account.accountType | titlecase }}</p>
                      <p class="text-xs font-mono text-on-surface-variant">{{ account.accountNumber }}</p>
                    </div>
                    <div class="flex items-center gap-3">
                      <app-badge [status]="mapAccountStatus(account.accountStatus)">{{ account.accountStatus }}</app-badge>
                      <p class="font-headline font-bold text-on-surface">{{ account.accountBalance | currency:'PHP':'symbol':'1.2-2' }}</p>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-3">
                    <select [value]="account.accountStatus" (change)="changeAccountStatus(account, $any($event.target).value)" class="px-4 py-3 rounded-xl bg-white border border-outline-variant/20 text-sm font-bold">
                      <option value="Verified">Verified</option>
                      <option value="Frozen">Frozen</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <form [formGroup]="adjustmentForm" class="grid grid-cols-1 md:grid-cols-4 gap-3" (ngSubmit)="submitAdjustment(account)">
                    <input formControlName="amount" type="number" class="rounded-xl bg-white px-4 py-3 border border-outline-variant/20" placeholder="Amount" />
                    <select formControlName="adjustmentType" class="rounded-xl bg-white px-4 py-3 border border-outline-variant/20">
                      <option value="credit">Credit</option>
                      <option value="debit">Debit</option>
                    </select>
                    <input formControlName="description" type="text" class="rounded-xl bg-white px-4 py-3 border border-outline-variant/20 md:col-span-2" placeholder="Mandatory reason for adjustment" />
                    <div class="md:col-span-4">
                      <button type="submit" class="px-5 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm">Post Adjustment to This Account</button>
                    </div>
                  </form>
                </div>
              }
            </div>
          </section>
        </div>
      </app-modal>
    }
  `
})
export class UsersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly fb = inject(FormBuilder);

  users = signal<SystemUser[]>([]);
  selectedUser = signal<AdminUserDetail | null>(null);
  actionMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  passwordReset = signal<PasswordResetResponse | null>(null);
  
  currentPage = signal(0);
  pageSize = signal(10);
  totalElements = signal(0);
  totalPages = signal(0);

  profileForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    middleName: [''],
    lastName: ['', Validators.required],
    userEmail: ['', Validators.required],
    phone: [''],
  });

  adjustmentForm = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    adjustmentType: ['credit' as 'credit' | 'debit', Validators.required],
    description: ['', Validators.required],
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(page: number = 0) {
    this.adminService.getUsers(page, this.pageSize()).subscribe({
      next: (response) => {
        this.users.set(response.content);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.currentPage.set(response.number);
      }
    });
  }

  openUser(userId: number): void {
    this.actionMessage.set(null);
    this.errorMessage.set(null);
    this.passwordReset.set(null);
    this.adjustmentForm.reset({ amount: 0, adjustmentType: 'credit', description: '' });
    this.adminService.getUserDetail(userId).subscribe({
      next: detail => {
        this.selectedUser.set(detail);
        this.profileForm.reset({
          firstName: detail.firstName,
          middleName: detail.middleName || '',
          lastName: detail.lastName,
          userEmail: detail.userEmail,
          phone: detail.phone || '',
        });
      },
      error: err => this.errorMessage.set(this.extractError(err))
    });
  }

  closeUser(): void {
    this.selectedUser.set(null);
    this.passwordReset.set(null);
  }

  saveProfile(): void {
    const detail = this.selectedUser();
    if (!detail || this.profileForm.invalid) return;

    this.adminService.updateUserProfile(detail.userId, this.profileForm.getRawValue()).subscribe({
      next: user => {
        this.actionMessage.set('Profile updated.');
        this.loadUsers(this.currentPage());
        this.openUser(user.userId);
      },
      error: err => this.errorMessage.set(this.extractError(err))
    });
  }

  toggleUserStatus(user: SystemUser): void {
    const targetStatus = user.userStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    this.adminService.updateUserStatus(user.userId, targetStatus).subscribe({
      next: () => {
        this.actionMessage.set(`User ${targetStatus.toLowerCase()}.`);
        this.loadUsers(this.currentPage());
        const current = this.selectedUser();
        if (current?.userId === user.userId) {
          this.openUser(user.userId);
        }
      },
      error: err => this.errorMessage.set(this.extractError(err))
    });
  }

  toggleDetailUserStatus(detail: AdminUserDetail): void {
    this.toggleUserStatus({
      userId: detail.userId,
      firstName: detail.firstName,
      middleName: detail.middleName,
      lastName: detail.lastName,
      userEmail: detail.userEmail,
      role: detail.role,
      userStatus: detail.userStatus,
      accountCount: detail.accounts.length,
      accountNumber: detail.accounts[0]?.accountNumber
    });
  }

  changeRole(role: string): void {
    const detail = this.selectedUser();
    if (!detail) return;

    this.adminService.updateUserRole(detail.userId, role).subscribe({
      next: () => {
        this.actionMessage.set(`Role updated to ${role}.`);
        this.loadUsers(this.currentPage());
        this.openUser(detail.userId);
      },
      error: err => this.errorMessage.set(this.extractError(err))
    });
  }

  resetPassword(): void {
    const detail = this.selectedUser();
    if (!detail) return;

    this.adminService.resetUserPassword(detail.userId).subscribe({
      next: response => {
        this.passwordReset.set(response);
        this.actionMessage.set('Temporary password generated.');
      },
      error: err => this.errorMessage.set(this.extractError(err))
    });
  }

  changeAccountStatus(account: AdminAccount, status: string): void {
    this.adminService.updateAccountStatus(account.accountId, status).subscribe({
      next: () => {
        this.actionMessage.set(`Account ${status.toLowerCase()}.`);
        const detail = this.selectedUser();
        if (detail) {
          this.openUser(detail.userId);
        }
      },
      error: err => this.errorMessage.set(this.extractError(err))
    });
  }

  submitAdjustment(account: AdminAccount): void {
    if (this.adjustmentForm.invalid) return;
    const detail = this.selectedUser();
    if (!detail) return;

    const value = this.adjustmentForm.getRawValue();
    this.adminService.postAccountAdjustment(account.accountId, value.amount, value.adjustmentType, value.description).subscribe({
      next: () => {
        this.actionMessage.set('Administrative adjustment posted.');
        this.adjustmentForm.reset({ amount: 0, adjustmentType: 'credit', description: '' });
        this.openUser(detail.userId);
      },
      error: err => this.errorMessage.set(this.extractError(err))
    });
  }

  mapAccountStatus(status: string): 'verified' | 'completed' | 'declined' {
    switch (status) {
      case 'Verified':
        return 'verified';
      case 'Frozen':
        return 'declined';
      default:
        return 'completed';
    }
  }

  private extractError(err: any): string {
    return typeof err.error === 'string' ? err.error : (err.error?.message || 'Admin action failed.');
  }
}
