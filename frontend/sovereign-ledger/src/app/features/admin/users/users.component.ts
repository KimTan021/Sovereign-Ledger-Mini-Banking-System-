import { Component, ChangeDetectionStrategy, inject, signal, OnInit, effect, ElementRef, viewChild } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminAccount, AdminService, AdminUserDetail, PasswordResetResponse, SystemUser } from '../../../core/services/admin.service';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { NotificationService } from '../../../core/services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin-users',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, BadgeComponent, PaginationComponent, ModalComponent],
  template: `
    <div #pageTop class="p-12 lg:p-16 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-screen-2xl mx-auto">
      <header class="space-y-1 block">
        <h1 class="text-3xl font-headline font-extrabold tracking-tighter text-primary">Global Directory</h1>
        <p class="text-on-surface-variant">Manage user access, profile data, account controls, and administrative adjustments.</p>
      </header>

      <div class="flex justify-end">
        <button type="button"
                (click)="exportUsers()"
                class="px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-sm hover:translate-y-[-1px] transition-transform">
          Export Users CSV
        </button>
      </div>
      
      <div class="bg-surface-container-low/30 rounded-2xl overflow-hidden shadow-ambient">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr class="bg-surface-container-high/60 text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-bold">
                <th class="px-6 py-5 first:rounded-l-2xl">Entity Identity</th>
                <th class="px-6 py-5">Primary Account</th>
                <th class="px-6 py-5">Email</th>
                <th class="px-6 py-5">Access</th>
                <th class="px-6 py-5 text-right last:rounded-r-2xl">Actions</th>
              </tr>
            </thead>
            <tbody class="space-y-0">
              @for (user of users(); track user.userId; let even = $even) {
                <tr class="transition-colors group {{ even ? 'bg-white' : 'bg-surface-container-low/40' }}">
                  <td class="px-6 py-5 first:rounded-l-2xl">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/5 group-hover:scale-110 transition-transform">
                        {{ user.firstName[0] }}{{ user.lastName[0] }}
                      </div>
                      <div>
                        <p class="font-bold text-on-surface text-sm">{{ user.firstName }} {{ user.middleName ? user.middleName[0] + '.' : '' }} {{ user.lastName }}</p>
                        <p class="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold opacity-60">{{ user.accountCount }} linked account{{ user.accountCount === 1 ? '' : 's' }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-5 font-mono text-primary font-bold tracking-wider text-sm">{{ user.accountNumber || 'N/A' }}</td>
                  <td class="px-6 py-5 text-on-surface-variant text-sm">{{ user.userEmail }}</td>
                  <td class="px-6 py-5">
                    <div class="flex items-center gap-2">
                      <app-badge [status]="user.userStatus === 'ACTIVE' ? 'completed' : 'declined'">
                        {{ user.userStatus | titlecase }}
                      </app-badge>
                    </div>
                  </td>
                  <td class="px-6 py-5 text-right last:rounded-r-2xl">
                    <div class="flex items-center justify-end gap-2">
                      <button type="button"
                              (click)="toggleUserStatus(user)"
                              class="px-3 py-2 rounded-2xl text-[10px] uppercase tracking-widest font-bold bg-surface-container-high/50 hover:bg-surface-container-highest transition-colors">
                        {{ user.userStatus === 'ACTIVE' ? 'Suspend' : 'Reactivate' }}
                      </button>
                      <button type="button"
                              (click)="openUser(user.userId)"
                              class="px-4 py-2 rounded-2xl bg-primary text-on-primary text-[10px] uppercase tracking-widest font-bold shadow-sm hover:translate-y-[-1px] transition-transform">
                        Manage
                      </button>
                    </div>
                  </td>
                </tr>
                <tr class="h-1"></tr>
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
              <input formControlName="firstName" type="text" class="rounded-2xl bg-surface-container-highest/50 px-4 py-4 focus:bg-white transition-colors" placeholder="First name" />
              @if (getProfileError('firstName')) { <p class="md:col-span-1 text-xs font-semibold text-error">{{ getProfileError('firstName') }}</p> }
              <input formControlName="middleName" type="text" class="rounded-2xl bg-surface-container-highest/50 px-4 py-4 focus:bg-white transition-colors" placeholder="Middle name" />
              @if (getProfileError('middleName')) { <p class="md:col-span-1 text-xs font-semibold text-error">{{ getProfileError('middleName') }}</p> }
              <input formControlName="lastName" type="text" class="rounded-2xl bg-surface-container-highest/50 px-4 py-4 focus:bg-white transition-colors" placeholder="Last name" />
              @if (getProfileError('lastName')) { <p class="md:col-span-1 text-xs font-semibold text-error">{{ getProfileError('lastName') }}</p> }
              <input formControlName="phone" type="text" class="rounded-2xl bg-surface-container-highest/50 px-4 py-4 focus:bg-white transition-colors" placeholder="Phone" />
              @if (getProfileError('phone')) { <p class="md:col-span-1 text-xs font-semibold text-error">{{ getProfileError('phone') }}</p> }
              <input formControlName="userEmail" type="email" class="md:col-span-2 rounded-2xl bg-surface-container-highest/50 px-4 py-4 focus:bg-white transition-colors" placeholder="Email" />
              @if (getProfileError('userEmail')) { <p class="md:col-span-2 text-xs font-semibold text-error">{{ getProfileError('userEmail') }}</p> }
              <div class="md:col-span-2 flex flex-wrap gap-3">
                <button type="submit" class="px-6 py-4 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-sm">Save Profile</button>
                <button type="button" (click)="toggleDetailUserStatus(detail)" class="px-6 py-4 rounded-2xl bg-surface-container-high/50 font-bold text-sm">
                  {{ detail.userStatus === 'ACTIVE' ? 'Suspend User' : 'Reactivate User' }}
                </button>
                <select [value]="detail.role" (change)="changeRole($any($event.target).value)" class="px-5 py-4 rounded-2xl bg-surface-container-highest/50 text-sm font-bold">
                  <option value="user">Customer Role</option>
                  <option value="admin">Admin Role</option>
                </select>
                <button type="button" (click)="resetPassword()" class="px-6 py-4 rounded-2xl bg-surface-container-low font-bold text-sm">
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

                  <form [formGroup]="adjustmentForm" class="grid grid-cols-1 md:grid-cols-4 gap-4" (ngSubmit)="submitAdjustment(account)">
                    <div class="space-y-1">
                      <input formControlName="amount" type="number" class="w-full rounded-2xl bg-white px-4 py-4 border-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary" placeholder="Amount" />
                      @if (getAdjustmentError('amount')) { <p class="text-[10px] font-bold text-error uppercase tracking-widest px-2">{{ getAdjustmentError('amount') }}</p> }
                    </div>
                    <select formControlName="adjustmentType" class="rounded-2xl bg-white px-4 py-4 border-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold">
                      <option value="credit">Credit</option>
                      <option value="debit">Debit</option>
                    </select>
                    <div class="md:col-span-2 space-y-1">
                      <input formControlName="description" type="text" class="w-full rounded-2xl bg-white px-4 py-4 border-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Adjustment reason" />
                      @if (getAdjustmentError('description')) { <p class="text-[10px] font-bold text-error uppercase tracking-widest px-2">{{ getAdjustmentError('description') }}</p> }
                    </div>
                    <div class="md:col-span-4 mt-2">
                      <button type="submit" class="w-full px-6 py-4 rounded-2xl bg-primary text-on-primary font-black text-sm uppercase tracking-widest shadow-ambient hover:scale-[1.01] active:scale-[0.99] transition-all">
                        Post Adjustment
                      </button>
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
  private readonly notificationService = inject(NotificationService);
  private readonly pageTop = viewChild<ElementRef<HTMLElement>>('pageTop');
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  users = signal<SystemUser[]>([]);
  selectedUser = signal<AdminUserDetail | null>(null);
  actionMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  passwordReset = signal<PasswordResetResponse | null>(null);
  profileSubmitted = signal(false);
  adjustmentSubmitted = signal(false);
  
  currentPage = signal(0);
  pageSize = signal(10);
  totalElements = signal(0);
  totalPages = signal(0);
  private detailRequestToken = 0;
  private pendingManageUserId = signal<number | null>(null);

  profileForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(45), Validators.pattern(/^[A-Za-z][A-Za-z\s'-]*$/)]],
    middleName: ['', [Validators.maxLength(45), Validators.pattern(/^$|^[A-Za-z][A-Za-z\s'-]*$/)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(45), Validators.pattern(/^[A-Za-z][A-Za-z\s'-]*$/)]],
    userEmail: ['', [Validators.required, Validators.email, Validators.maxLength(512)]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9 ]{10,15}$/)]],
  });

  adjustmentForm = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    adjustmentType: ['credit' as 'credit' | 'debit', Validators.required],
    description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
  });

  private readonly refreshOnDataChange = effect(() => {
    if (this.notificationService.dataVersion() === 0) {
      return;
    }
    this.loadUsers(this.currentPage());
    const detail = this.selectedUser();
    if (detail) {
      this.openUser(detail.userId);
    }
  });

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const rawUserId = params.get('manageUserId');
      this.pendingManageUserId.set(rawUserId ? Number(rawUserId) : null);
      if (rawUserId) {
        this.openUser(Number(rawUserId));
      }
    });
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

  changePage(page: number): void {
    this.loadUsers(page);
    requestAnimationFrame(() => {
      this.pageTop()?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }

  exportUsers(): void {
    const exportSize = Math.max(this.totalElements(), this.pageSize(), 100);
    this.adminService.getUsers(0, exportSize).subscribe({
      next: response => this.adminService.exportUsersCSV(
        response.content,
        `admin-users-${new Date().toISOString().split('T')[0]}.csv`
      )
    });
  }

  openUser(userId: number): void {
    const requestToken = ++this.detailRequestToken;
    this.actionMessage.set(null);
    this.errorMessage.set(null);
    this.passwordReset.set(null);
    this.profileSubmitted.set(false);
    this.adjustmentSubmitted.set(false);
    this.adjustmentForm.reset({ amount: 0, adjustmentType: 'credit', description: '' });
    this.adminService.getUserDetail(userId).subscribe({
      next: detail => {
        if (requestToken !== this.detailRequestToken) {
          return;
        }
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
    this.detailRequestToken++;
    this.selectedUser.set(null);
    this.passwordReset.set(null);
    this.actionMessage.set(null);
    this.errorMessage.set(null);
    this.profileSubmitted.set(false);
    this.adjustmentSubmitted.set(false);
    if (this.pendingManageUserId() !== null) {
      this.pendingManageUserId.set(null);
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { manageUserId: null },
        queryParamsHandling: 'merge'
      });
    }
  }

  saveProfile(): void {
    const detail = this.selectedUser();
    this.profileSubmitted.set(true);
    this.profileForm.markAllAsTouched();
    if (!detail || this.profileForm.invalid) return;

    this.adminService.updateUserProfile(detail.userId, this.profileForm.getRawValue()).subscribe({
      next: user => {
        this.profileSubmitted.set(false);
        this.actionMessage.set('Profile updated.');
        this.loadUsers(this.currentPage());
        this.openUser(user.userId);
      },
      error: err => this.handleFormError(err, 'profile')
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
      error: err => this.handleFormError(err)
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
      error: err => this.handleFormError(err)
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
      error: err => this.handleFormError(err)
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
      error: err => this.handleFormError(err)
    });
  }

  submitAdjustment(account: AdminAccount): void {
    this.adjustmentSubmitted.set(true);
    this.adjustmentForm.markAllAsTouched();
    if (this.adjustmentForm.invalid) return;
    const detail = this.selectedUser();
    if (!detail) return;

    const value = this.adjustmentForm.getRawValue();
    this.adminService.postAccountAdjustment(account.accountId, value.amount, value.adjustmentType, value.description).subscribe({
      next: () => {
        this.actionMessage.set('Administrative adjustment posted.');
        this.adjustmentForm.reset({ amount: 0, adjustmentType: 'credit', description: '' });
        this.adjustmentSubmitted.set(false);
        this.openUser(detail.userId);
      },
      error: err => this.handleFormError(err, 'adjustment')
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

  private handleFormError(err: any, form?: 'profile' | 'adjustment'): void {
    this.errorMessage.set(this.extractError(err));
    const fieldErrors = err?.error?.fieldErrors as Record<string, string> | undefined;
    if (!fieldErrors) {
      return;
    }

    const targetForm = form === 'adjustment' ? this.adjustmentForm : this.profileForm;
    Object.entries(fieldErrors).forEach(([field, message]) => {
      const control = (targetForm as any).get(field);
      if (!control) {
        return;
      }
      control.setErrors({ ...(control.errors ?? {}), server: message });
      control.markAsTouched();
    });
  }

  hasProfileError(controlName: string): boolean {
    const control = this.profileForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.profileSubmitted());
  }

  getProfileError(controlName: string): string | null {
    const control = this.profileForm.get(controlName);
    if (!control || !this.hasProfileError(controlName)) return null;
    if (control.hasError('server')) return control.getError('server');
    if (control.hasError('required')) return controlName === 'phone' ? 'Phone number is required.' : `${controlName === 'userEmail' ? 'Email address' : controlName === 'firstName' ? 'First name' : 'Last name'} is required.`;
    if (control.hasError('email')) return 'Enter a valid email address.';
    if (control.hasError('pattern')) return controlName === 'phone'
      ? 'Phone number must contain 10 to 15 digits and may include spaces or a leading plus sign.'
      : 'Only letters, spaces, apostrophes, and hyphens are allowed.';
    if (control.hasError('minlength')) return controlName === 'firstName' ? 'First name must be at least 2 characters.' : 'Last name must be at least 2 characters.';
    if (control.hasError('maxlength')) return controlName === 'userEmail'
      ? 'Email address must not exceed 512 characters.'
      : `${controlName === 'middleName' ? 'Middle name' : controlName === 'firstName' ? 'First name' : 'Last name'} must not exceed 45 characters.`;
    return null;
  }

  hasAdjustmentError(controlName: string): boolean {
    const control = this.adjustmentForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.adjustmentSubmitted());
  }

  getAdjustmentError(controlName: string): string | null {
    const control = this.adjustmentForm.get(controlName);
    if (!control || !this.hasAdjustmentError(controlName)) return null;
    if (control.hasError('server')) return control.getError('server');
    if (control.hasError('required')) return controlName === 'description' ? 'Adjustment reason is required.' : 'This field is required.';
    if (control.hasError('min')) return 'Adjustment amount must be greater than zero.';
    if (control.hasError('minlength')) return 'Adjustment reason must be at least 5 characters.';
    if (control.hasError('maxlength')) return 'Adjustment reason must not exceed 150 characters.';
    return null;
  }
}
