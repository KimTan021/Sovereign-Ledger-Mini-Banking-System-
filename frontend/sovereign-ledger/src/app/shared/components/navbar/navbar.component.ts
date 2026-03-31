import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, DatePipe, NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, ModalComponent, CommonModule, NgOptimizedImage, DatePipe],
  template: `
    <nav class="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-8">
            <a routerLink="/customer/dashboard" class="flex items-center gap-2 group cursor-pointer">
              <img ngSrc="/logo.png" width="32" height="32" alt="Sovereign Ledger" class="h-8 w-auto transition-transform group-hover:scale-105" />
              <span class="text-xl font-black text-primary font-headline tracking-tighter hidden sm:inline">Sovereign</span>
            </a>
            <div class="hidden md:flex items-center gap-6">
              <a routerLink="/customer/dashboard"
                 routerLinkActive="text-primary after:content-[''] after:absolute after:bottom-[-22px] after:left-0 after:w-full after:h-[2px] after:bg-primary"
                 [routerLinkActiveOptions]="{ exact: true }"
                 class="relative text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Dashboard</a>
              <a routerLink="/customer/banking"
                 routerLinkActive="text-primary after:content-[''] after:absolute after:bottom-[-22px] after:left-0 after:w-full after:h-[2px] after:bg-primary"
                 class="relative text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Banking</a>
              <a routerLink="/customer/transfer"
                 routerLinkActive="text-primary after:content-[''] after:absolute after:bottom-[-22px] after:left-0 after:w-full after:h-[2px] after:bg-primary"
                 class="relative text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Transfer</a>
              <a routerLink="/customer/history"
                 routerLinkActive="text-primary after:content-[''] after:absolute after:bottom-[-22px] after:left-0 after:w-full after:h-[2px] after:bg-primary"
                 class="relative text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer">History</a>
              <a routerLink="/customer/settings"
                 routerLinkActive="text-primary after:content-[''] after:absolute after:bottom-[-22px] after:left-0 after:w-full after:h-[2px] after:bg-primary"
                 class="relative text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Settings</a>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <button (click)="showNotifications.set(true)"
                    class="p-2 text-on-surface-variant hover:text-primary transition-colors hidden sm:block relative cursor-pointer">
              <span class="material-symbols-outlined">notifications</span>
              @if (notificationService.unreadCount() > 0) {
                <span class="absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full bg-error px-1 text-[10px] font-bold text-white flex items-center justify-center">
                  {{ notificationService.unreadCount() > 9 ? '9+' : notificationService.unreadCount() }}
                </span>
              }
            </button>
            <button (click)="onLogout()"
                    class="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-on-surface-variant hover:text-error transition-colors cursor-pointer">
              <span class="material-symbols-outlined text-lg">logout</span>
              Logout
            </button>

            <button (click)="toggleMenu()" class="md:hidden p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              <span class="material-symbols-outlined">{{ isMenuOpen() ? 'close' : 'menu' }}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    @if (showNotifications()) {
       <app-modal title="Notifications" (close)="showNotifications.set(false)">
         <div class="space-y-4">
           @for (notification of notificationService.notifications(); track notification.notificationId) {
             <button type="button"
                     (click)="markAsRead(notification.notificationId)"
                     class="w-full text-left rounded-2xl px-4 py-4 transition-colors"
                     [class]="notification.isRead ? 'bg-surface-container-low hover:bg-surface-container-high' : 'bg-primary/5 hover:bg-primary/10'">
               <div class="flex items-start justify-between gap-3">
                 <div>
                   <p class="font-bold text-sm text-primary">{{ notification.title }}</p>
                   <p class="mt-1 text-xs text-on-surface-variant">{{ notification.message }}</p>
                   <p class="mt-2 text-[10px] uppercase tracking-widest text-outline">{{ notification.createdAt | date:'medium' }}</p>
                 </div>
                 @if (!notification.isRead) {
                   <span class="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-primary"></span>
                 }
               </div>
             </button>
           } @empty {
             <div class="rounded-xl bg-surface-container-high px-4 py-6 text-center text-sm text-on-surface-variant">
               No notifications yet.
             </div>
           }
         </div>
       </app-modal>
    }

    <div class="fixed bottom-4 right-4 z-[1000] flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-3">
      @for (toast of notificationService.toasts(); track toast.notificationId) {
        <div class="rounded-2xl border border-primary/10 bg-white/95 p-4 shadow-2xl backdrop-blur">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-bold text-sm text-primary">{{ toast.title }}</p>
              <p class="mt-1 text-xs leading-5 text-on-surface-variant">{{ toast.message }}</p>
            </div>
            <button type="button" (click)="notificationService.dismissToast(toast.notificationId)" class="text-on-surface-variant hover:text-primary">
              <span class="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      }
    </div>

    @if (isMenuOpen()) {
      <div class="md:hidden fixed inset-0 z-[9999] bg-white flex flex-col p-6 animate-in slide-in-from-top duration-300" style="background-color: white !important;">
        <div class="flex justify-between items-center mb-10">
          <div class="flex items-center gap-2">
            <img ngSrc="/logo.png" width="32" height="32" alt="Sovereign Ledger" class="h-8 w-auto" />
            <span class="text-xl font-black text-primary font-headline">Sovereign</span>
          </div>
          <button (click)="toggleMenu()" class="p-2 text-on-surface-variant cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="flex flex-col gap-6 text-xl font-bold">
          <a routerLink="/customer/dashboard" (click)="toggleMenu()" class="text-on-surface hover:text-primary transition-colors cursor-pointer">Dashboard</a>
          <a routerLink="/customer/banking" (click)="toggleMenu()" class="text-on-surface hover:text-primary transition-colors cursor-pointer">Banking</a>
          <a routerLink="/customer/transfer" (click)="toggleMenu()" class="text-on-surface hover:text-primary transition-colors cursor-pointer">Transfer</a>
          <a routerLink="/customer/history" (click)="toggleMenu()" class="text-on-surface hover:text-primary transition-colors cursor-pointer">History</a>
          <a routerLink="/customer/settings" (click)="toggleMenu()" class="text-on-surface hover:text-primary transition-colors cursor-pointer">Settings</a>
          <div class="h-4"></div>
          <button (click)="onLogout(); toggleMenu()" class="flex items-center gap-2 text-error text-left cursor-pointer">
            <span class="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </div>
    }
  `,
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  readonly notificationService = inject(NotificationService);

  isMenuOpen = signal(false);
  showNotifications = signal(false);

  toggleMenu(): void {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId);
  }

  onLogout(): void {
    this.notificationService.shutdown();
    this.authService.logout();
  }
}
