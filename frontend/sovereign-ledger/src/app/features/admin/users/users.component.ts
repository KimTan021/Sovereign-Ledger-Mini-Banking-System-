import { Component, ChangeDetectionStrategy, inject, signal, OnInit, effect, ElementRef, viewChild, computed, untracked } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminAccount, AdminService, AdminUserDetail, PasswordResetResponse, SystemUser } from '../../../core/services/admin.service';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin-users',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, BadgeComponent, PaginationComponent, ModalComponent],
  template: `
    <div #pageTop class="p-12 lg:p-16 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-screen-2xl mx-auto">
      <div class="flex items-center justify-between">
        <header class="space-y-1 block">
          <h1 class="text-3xl font-headline font-extrabold tracking-tighter text-primary">Global Directory</h1>
          <p class="text-on-surface-variant">Manage user access, profile data, account controls, and administrative adjustments.</p>
        </header>
        <div class="flex items-center gap-4">
          @if (isSuperAdmin()) {
            <button type="button"
                    (click)="isCreateAdminModalOpen.set(true)"
                    class="px-6 py-3 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed font-bold text-sm shadow-sm hover:translate-y-[-1px] transition-transform">
              Add Administrative Account
            </button>
          }
          <button type="button"
                  (click)="exportUsers()"
                  class="px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-sm hover:translate-y-[-1px] transition-transform">
            Export Users CSV
          </button>
        </div>
      </div>

      <div class="bg-surface-container-low/30 rounded-2xl overflow-hidden shadow-ambient">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr class="bg-surface-container-high/60 text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-bold">
                <th class="px-6 py-5 first:rounded-l-2xl">Entity Identity</th>
                <th class="px-6 py-5">System Role</th>
                <th class="px-6 py-5">Email</th>
                <th class="px-6 py-5">Account Reference</th>
                <th class="px-6 py-5">Access</th>
                <th class="px-6 py-5 text-right last:rounded-r-2xl">Actions</th>
              </tr>
            </thead>
            <tbody class="space-y-0">
              @for (user of users(); track user.userId; let even = $even) {
                @let isSelf = user.userId === currentUser()?.userId;
                @let isTargetAdmin = user.role === 'admin' || user.role === 'super_admin';
                @let canManage = isSuperAdmin() || (!isTargetAdmin && !isSelf);
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
                  <td class="px-6 py-5">
                    <div class="flex items-center gap-2">
                      @if (user.role === 'super_admin') {
                        <app-badge status="verified">Super Admin</app-badge>
                      } @else if (user.role === 'admin') {
                        <app-badge status="verified">Admin</app-badge>
                      } @else {
                        <app-badge status="completed">Customer</app-badge>
                      }
                    </div>
                  </td>
                  <td class="px-6 py-5 text-on-surface-variant text-sm">{{ user.userEmail }}</td>
                  <td class="px-6 py-5 font-mono text-primary font-bold tracking-wider text-sm">
                    @if (isTargetAdmin) {
                      <span class="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold opacity-30 italic">System Account</span>
                    } @else {
                      {{ user.accountNumber || 'N/A' }}
                    }
                  </td>
                  <td class="px-6 py-5">
                    <app-badge [status]="user.userStatus === 'ACTIVE' ? 'completed' : 'declined'">
                      {{ user.userStatus | titlecase }}
                    </app-badge>
                  </td>
                  <td class="px-6 py-5 text-right last:rounded-r-2xl">
                    <div class="flex items-center justify-end gap-2">
                      @if (!isSelf && canManage) {
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
                        @if (isSuperAdmin()) {
                          <button type="button"
                                  (click)="deleteUser(user.userId)"
                                  class="w-9 h-9 flex items-center justify-center rounded-2xl bg-error/10 text-error hover:bg-error hover:text-white transition-all">
                            <span class="material-symbols-outlined text-sm">delete</span>
                          </button>
                        }
                      } @else if (isSelf) {
                        <span class="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold opacity-30 italic px-4">Self Identity</span>
                      } @else {
                        <span class="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold opacity-30 italic px-4">Authority Restricted</span>
                      }
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

    @if (isModalOpen(); as detail) {
      <app-modal [title]="'Manage ' + (selectedUser()?.firstName || '') + ' ' + (selectedUser()?.lastName || '')" (close)="closeUser()">
        <div class="space-y-8">
          @if (selectedUser(); as detail) {
          @if (actionMessage()) {
            <div class="rounded-xl border border-tertiary-fixed/20 bg-tertiary-fixed/5 px-4 py-4 text-sm text-on-tertiary-fixed-variant flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div class="w-6 h-6 rounded-full bg-tertiary-fixed/20 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[16px]">check</span>
              </div>
              <p class="font-bold tracking-tight">{{ actionMessage() }}</p>
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
                @if (canManageDetail()) {
                  <button type="submit" class="px-6 py-4 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-sm">Save Profile</button>
                  @if (!isDetailSelf()) {
                    <button type="button" (click)="toggleDetailUserStatus(detail)" class="px-6 py-4 rounded-2xl bg-surface-container-high/50 font-bold text-sm">
                      {{ detail.userStatus === 'ACTIVE' ? 'Suspend User' : 'Reactivate User' }}
                    </button>
                    @if (isSuperAdmin() && (detail.role === 'admin' || detail.role === 'super_admin')) {
                      <select [value]="detail.role" (change)="changeRole($any($event.target).value)" class="px-5 py-4 rounded-2xl bg-surface-container-highest/50 text-sm font-bold">
                        <option value="admin">Admin Role</option>
                        <option value="super_admin">Super Admin Role</option>
                      </select>
                    }
                  }
                  @if (isResetConfirmOpen()) {
                    <div class="md:col-span-2 w-full p-6 rounded-2xl bg-error-container/10 border border-error/10 animate-in fade-in zoom-in-95 duration-200">
                      <div class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                          <span class="material-symbols-outlined text-error text-xl">warning</span>
                        </div>
                        <div class="space-y-1 pr-4">
                          <p class="text-sm font-bold text-on-error-container">Confirm Password Overwrite</p>
                          <p class="text-xs text-on-error-container/70 leading-relaxed">This action will immediately invalidate the current credentials. A dynamic temporary password will be generated for administrative hand-off.</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-3 mt-6">
                        <button type="button" 
                                (click)="confirmReset()"
                                class="px-6 py-3 rounded-xl bg-error text-on-error font-black text-[10px] uppercase tracking-[0.2em] shadow-sm hover:bg-error/90 active:scale-95 transition-all">
                          Confirm Invalidation
                        </button>
                        <button type="button" 
                                (click)="cancelReset()"
                                class="px-6 py-3 rounded-xl bg-surface-container-highest text-on-surface-variant font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-surface-dim transition-all">
                          Keep Current
                        </button>
                      </div>
                    </div>
                  } @else {
                    <button type="button" (click)="resetPassword()" class="px-6 py-4 rounded-2xl bg-surface-container-low font-bold text-sm hover:bg-surface-container-high transition-colors">
                      Reset Password
                    </button>
                  }
                } @else {
                   <div class="w-full p-4 rounded-xl bg-surface-container-highest/50 border border-outline-variant/10 flex items-center gap-3">
                     <span class="material-symbols-outlined text-primary opacity-50">lock</span>
                     <p class="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Administrative Management Restricted</p>
                   </div>
                }
              </div>
            </form>

            @if (passwordReset(); as passwordInfo) {
              <div class="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
                <p class="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Temporary Password</p>
                <p class="mt-2 font-mono text-primary font-bold">{{ passwordInfo.temporaryPassword }}</p>
              </div>
            }
          </section>

          @if (detail.role !== 'admin' && detail.role !== 'super_admin') {
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
                      <select [disabled]="!canManageDetail()" [value]="account.accountStatus" (change)="changeAccountStatus(account, $any($event.target).value)" class="px-4 py-3 rounded-xl bg-white border border-outline-variant/20 text-sm font-bold disabled:opacity-30">
                        <option value="Verified">Verified</option>
                        <option value="Frozen">Frozen</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <form [formGroup]="adjustmentForm" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-start" (ngSubmit)="submitAdjustment(account)">
                      <div class="md:col-span-2 space-y-1">
                        <input formControlName="amount" type="number" class="w-full rounded-2xl bg-white px-4 py-4 border-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary" placeholder="Amount" />
                        @if (getAdjustmentError('amount')) { <p class="text-[10px] font-bold text-error uppercase tracking-widest px-2 animate-in fade-in slide-in-from-top-1">{{ getAdjustmentError('amount') }}</p> }
                      </div>
                      <select formControlName="adjustmentType" class="md:col-span-2 rounded-2xl bg-white px-4 py-4 border-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold cursor-pointer">
                        <option value="credit">Credit / Deposit</option>
                        <option value="debit">Debit / Withdrawal</option>
                      </select>
                      <div class="md:col-span-4 space-y-1">
                        <input formControlName="description" type="text" class="w-full rounded-2xl bg-white px-4 py-4 border-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Adjustment reason / compliance note" />
                        @if (getAdjustmentError('description')) { <p class="text-[10px] font-bold text-error uppercase tracking-widest px-2 animate-in fade-in slide-in-from-top-1">{{ getAdjustmentError('description') }}</p> }
                      </div>
                      <div class="md:col-span-4 mt-2">
                        <button type="submit" [disabled]="!canManageDetail()" class="w-full px-6 py-4 rounded-2xl bg-primary text-on-primary font-black text-sm uppercase tracking-widest shadow-ambient hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-30">
                          Post Adjustment
                        </button>
                      </div>
                    </form>
                  </div>
                }
              </div>
            </section>
          } @else {
            <div class="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/10 text-center space-y-3">
              <span class="material-symbols-outlined text-4xl text-primary opacity-20">shield_person</span>
              <p class="text-sm font-bold text-on-surface">Administrative Identity</p>
              <p class="text-xs text-on-surface-variant max-w-xs mx-auto opacity-70">This account is strictly for system governance and is not associated with functional banking instruments.</p>
            </div>
          }
        } @else {
          <div class="p-12 text-center">
            <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p class="text-sm font-bold text-on-surface-variant">Synchronizing user identity...</p>
          </div>
        }
      </div>
    </app-modal>
  }

    @if (isCreateAdminModalOpen()) {
      <app-modal title="Provision Administrative Account" (close)="isCreateAdminModalOpen.set(false)">
        <div class="space-y-8">
          @if (errorMessage()) {
            <div class="rounded-xl border border-error/20 bg-error-container/20 px-4 py-3 text-sm text-on-error-container">
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="adminForm" (ngSubmit)="createAdminAccount()" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1">
                <input formControlName="firstName" type="text" class="w-full rounded-2xl bg-surface-container-highest/50 px-4 py-4 focus:bg-white transition-colors" placeholder="First name" />
                @if (getAdminError('firstName')) { <p class="text-xs font-semibold text-error">{{ getAdminError('firstName') }}</p> }
              </div>
              <div class="space-y-1">
                <input formControlName="middleName" type="text" class="w-full rounded-2xl bg-surface-container-highest/50 px-4 py-4 focus:bg-white transition-colors" placeholder="Middle name (Optional)" />
                @if (getAdminError('middleName')) { <p class="text-xs font-semibold text-error">{{ getAdminError('middleName') }}</p> }
              </div>
              <div class="space-y-1 md:col-span-2">
                <input formControlName="lastName" type="text" class="w-full rounded-2xl bg-surface-container-highest/50 px-4 py-4 focus:bg-white transition-colors" placeholder="Last name" />
                @if (getAdminError('lastName')) { <p class="text-xs font-semibold text-error">{{ getAdminError('lastName') }}</p> }
              </div>
              <div class="space-y-1 md:col-span-2">
                <input formControlName="userEmail" type="email" class="w-full rounded-2xl bg-surface-container-highest/50 px-4 py-4 focus:bg-white transition-colors" placeholder="Administrative Email" />
                @if (getAdminError('userEmail')) { <p class="text-xs font-semibold text-error">{{ getAdminError('userEmail') }}</p> }
              </div>
              <div class="space-y-1 md:col-span-2">
                <input formControlName="password" type="password" class="w-full rounded-2xl bg-surface-container-highest/50 px-4 py-4 focus:bg-white transition-colors" placeholder="Initial Password" />
                @if (getAdminError('password')) { <p class="text-xs font-semibold text-error">{{ getAdminError('password') }}</p> }
              </div>
              <div class="space-y-1 md:col-span-2">
                <label class="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 px-1">Authority Level</label>
                <select formControlName="role" class="w-full px-5 py-4 rounded-2xl bg-surface-container-highest/50 text-sm font-bold">
                  <option value="admin">Standard Administrator</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
                @if (getAdminError('role')) { <p class="text-xs font-semibold text-error">{{ getAdminError('role') }}</p> }
              </div>
            </div>

            <button type="submit" class="w-full px-6 py-4 rounded-2xl bg-primary text-on-primary font-black text-sm uppercase tracking-widest shadow-ambient hover:scale-[1.01] active:scale-[0.99] transition-all">
              Provision Account
            </button>
          </form>
        </div>
      </app-modal>
    }

    @if (isDeleteConfirmOpen()) {
      <app-modal title="Purge Security Entity" (close)="cancelDelete()">
        <div class="space-y-8">
          <div class="p-8 rounded-3xl bg-error-container/10 border border-error/20 flex flex-col items-center text-center space-y-6">
            <div class="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center text-error mb-2 animate-bounce">
              <span class="material-symbols-outlined text-4xl">warning</span>
            </div>
            <div class="space-y-2">
              <h3 class="text-xl font-headline font-heavy text-on-error-container tracking-tighter">Irreversible Directory Purge</h3>
              <p class="text-sm text-on-error-container/70 max-w-sm leading-relaxed font-bold">You are about to permanently remove this user and all associated accounts, transaction histories, and security logs from the Sovereign Ledger.</p>
            </div>
            
            <div class="w-full p-4 rounded-2xl bg-error/5 border border-error/10 flex items-center gap-4 text-left">
              <div class="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error shrink-0">
                <span class="material-symbols-outlined text-lg">info</span>
              </div>
              <p class="text-[10px] uppercase font-black tracking-widest text-on-error-container opacity-80 leading-tight">This action cannot be undone. All linked financial data will be immediately destroyed.</p>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <button type="button"
                    (click)="confirmDelete()"
                    class="w-full px-6 py-5 rounded-2xl bg-error text-on-error font-black text-xs uppercase tracking-[0.2em] shadow-ambient hover:bg-error/90 active:scale-95 transition-all">
              Execute Final Purge
            </button>
            <button type="button"
                    (click)="cancelDelete()"
                    class="w-full px-6 py-5 rounded-2xl bg-surface-container-highest text-on-surface-variant font-bold text-xs uppercase tracking-[0.2em] hover:bg-surface-dim transition-all">
              Abort Deletion
            </button>
          </div>
        </div>
      </app-modal>
    }
  `
})
export class UsersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly fb = inject(FormBuilder);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly pageTop = viewChild<ElementRef<HTMLElement>>('pageTop');
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  currentUser = this.authService.user;
  isSuperAdmin = this.authService.isSuperAdmin;

  isDetailSelf = computed(() => this.selectedUser()?.userId === this.currentUser()?.userId);

  canManageDetail = computed(() => {
    const detail = this.selectedUser();
    if (!detail) return false;
    if (this.isSuperAdmin() && !this.isDetailSelf()) return true;
    const isTargetAdmin = detail.role === 'admin' || detail.role === 'super_admin';
    return !this.isDetailSelf() && !isTargetAdmin;
  });

  users = signal<SystemUser[]>([]);
  selectedUser = signal<AdminUserDetail | null>(null);
  isModalOpen = signal(false);
  isCreateAdminModalOpen = signal(false);
  isResetConfirmOpen = signal(false);
  isDeleteConfirmOpen = signal(false);
  userToDeleteId = signal<number | null>(null);
  actionMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  passwordReset = signal<PasswordResetResponse | null>(null);
  profileSubmitted = signal(false);
  adjustmentSubmitted = signal(false);
  adminSubmitted = signal(false);

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

  adminForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(45), Validators.pattern(/^[A-Za-z][A-Za-z\s'-]*$/)]],
    middleName: ['', [Validators.maxLength(45), Validators.pattern(/^$|^[A-Za-z][A-Za-z\s'-]*$/)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(45), Validators.pattern(/^[A-Za-z][A-Za-z\s'-]*$/)]],
    userEmail: ['', [Validators.required, Validators.email, Validators.maxLength(512)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['admin', Validators.required]
  });

  private readonly refreshOnDataChange = effect(() => {
    const version = this.notificationService.dataVersion();
    if (version === 0) return;

    untracked(() => {
      this.loadUsers(this.currentPage());
      const currentId = this.selectedUser()?.userId;
      if (currentId && !this.profileForm.dirty) {
        this.openUser(currentId);
      }
    });
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

  openUser(userId: number, keepMessages: boolean = false): void {
    const requestToken = ++this.detailRequestToken;
    this.isModalOpen.set(true);
    if (!keepMessages) {
      this.actionMessage.set(null);
      this.errorMessage.set(null);
      this.passwordReset.set(null);
    }
    this.profileSubmitted.set(false);
    this.adjustmentSubmitted.set(false);

    if (!this.profileForm.dirty) {
      this.adjustmentForm.reset({ amount: 0, adjustmentType: 'credit', description: '' });
    }

    this.adminService.getUserDetail(userId).subscribe({
      next: detail => {
        if (requestToken !== this.detailRequestToken) {
          return;
        }
        this.selectedUser.set(detail);
        if (!this.profileForm.dirty) {
          this.profileForm.reset({
            firstName: detail.firstName,
            middleName: detail.middleName || '',
            lastName: detail.lastName,
            userEmail: detail.userEmail,
            phone: detail.phone || '',
          });
        }
        
        // Dynamic Validation: Phone is only required for customers (user role)
        const isTargetAdmin = detail.role === 'admin' || detail.role === 'super_admin';
        const phoneControl = this.profileForm.get('phone');
        if (phoneControl) {
          if (isTargetAdmin) {
            phoneControl.setValidators([Validators.pattern(/^\+?[0-9 ]{10,15}$/)]);
          } else {
            phoneControl.setValidators([Validators.required, Validators.pattern(/^\+?[0-9 ]{10,15}$/)]);
          }
          phoneControl.updateValueAndValidity();
        }
      },
      error: err => this.errorMessage.set(this.extractError(err))
    });
  }

  closeUser(): void {
    this.detailRequestToken++;
    this.isModalOpen.set(false);
    this.selectedUser.set(null);
    this.passwordReset.set(null);
    this.actionMessage.set(null);
    this.errorMessage.set(null);
    this.isResetConfirmOpen.set(false);
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
    if (!detail || this.profileForm.invalid || !this.canManageDetail()) return;

    this.adminService.updateUserProfile(detail.userId, this.profileForm.getRawValue()).subscribe({
      next: user => {
        this.profileSubmitted.set(false);
        this.profileForm.markAsPristine();
        this.actionMessage.set('Profile identity updated successfully.');
        this.loadUsers(this.currentPage());
        this.openUser(user.userId, true);
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
    if (!detail || !this.isSuperAdmin()) return;

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
    this.isResetConfirmOpen.set(true);
  }

  cancelReset(): void {
    this.isResetConfirmOpen.set(false);
  }

  confirmReset(): void {
    const detail = this.selectedUser();
    if (!detail || !this.canManageDetail()) return;

    this.isResetConfirmOpen.set(false);
    this.adminService.resetUserPassword(detail.userId).subscribe({
      next: response => {
        this.passwordReset.set(response);
        this.actionMessage.set('Temporary administrative password generated.');
      },
      error: err => this.handleFormError(err)
    });
  }

  changeAccountStatus(account: AdminAccount, status: string): void {
    if (!this.canManageDetail()) return;
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

  deleteUser(userId: number): void {
    if (!this.isSuperAdmin()) return;
    this.userToDeleteId.set(userId);
    this.isDeleteConfirmOpen.set(true);
  }

  cancelDelete(): void {
    this.isDeleteConfirmOpen.set(false);
    this.userToDeleteId.set(null);
  }

  confirmDelete(): void {
    const userId = this.userToDeleteId();
    if (!userId || !this.isSuperAdmin()) return;

    this.isDeleteConfirmOpen.set(false);
    this.userToDeleteId.set(null);

    this.adminService.deleteUser(userId).subscribe({
      next: () => {
        this.actionMessage.set('User account purged from directory.');
        this.loadUsers(this.currentPage());
        if (this.selectedUser()?.userId === userId) {
          this.selectedUser.set(null);
        }
      },
      error: err => this.errorMessage.set(this.extractError(err))
    });
  }

  createAdminAccount(): void {
    this.adminSubmitted.set(true);
    this.adminForm.markAllAsTouched();
    if (this.adminForm.invalid || !this.isSuperAdmin()) return;

    this.adminService.createAdmin(this.adminForm.getRawValue()).subscribe({
      next: () => {
        this.adminSubmitted.set(false);
        this.isCreateAdminModalOpen.set(false);
        this.adminForm.reset({ role: 'admin' });
        this.actionMessage.set('Administrative account provisioned successfully.');
        this.loadUsers(0); // Reset to first page to see new admin
      },
      error: err => this.handleFormError(err, 'admin')
    });
  }

  submitAdjustment(account: AdminAccount): void {
    this.adjustmentSubmitted.set(true);
    this.adjustmentForm.markAllAsTouched();
    if (this.adjustmentForm.invalid || !this.canManageDetail()) return;
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

  private handleFormError(err: any, form?: 'profile' | 'adjustment' | 'admin'): void {
    this.errorMessage.set(this.extractError(err));
    const fieldErrors = err?.error?.fieldErrors as Record<string, string> | undefined;
    if (!fieldErrors) {
      return;
    }

    let targetForm = this.profileForm;
    if (form === 'adjustment') targetForm = this.adjustmentForm as any;
    if (form === 'admin') targetForm = this.adminForm as any;

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

  hasAdminError(controlName: string): boolean {
    const control = this.adminForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.adminSubmitted());
  }

  getAdminError(controlName: string): string | null {
    const control = this.adminForm.get(controlName);
    if (!control || !this.hasAdminError(controlName)) return null;
    if (control.hasError('server')) return control.getError('server');
    const label = controlName === 'userEmail' ? 'Email' : controlName === 'firstName' ? 'First name' : 'Last name';
    if (control.hasError('required')) return `${label} is required.`;
    if (control.hasError('email')) return 'Enter a valid email address.';
    if (control.hasError('minlength')) return controlName === 'password' ? 'Password must be at least 8 characters.' : `${label} must be at least 2 characters.`;
    if (control.hasError('pattern')) return 'Only letters and standard name characters are allowed.';
    return 'Invalid input.';
  }
}
