import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, ModalComponent, CommonModule, NgOptimizedImage],
  template: `
    <nav class="sticky top-0 z-50 bg-surface/80 backdrop-blur-md shadow-sm shadow-primary/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo & Desktop Navigation -->
          <div class="flex items-center gap-8">
            <a routerLink="/customer/dashboard" class="flex items-center gap-2 group cursor-pointer">
              <img ngSrc="/logo.png" width="32" height="32" alt="Sovereign Ledger" class="h-8 w-auto transition-transform group-hover:scale-105" />
              <span class="text-xl font-black text-primary font-headline tracking-tighter hidden sm:inline">Sovereign</span>
            </a>
            <div class="hidden md:flex items-center gap-6">
              <a routerLink="/customer/dashboard"
                 routerLinkActive="text-primary after:content-[''] after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-0.5 after:bg-primary"
                 [routerLinkActiveOptions]="{ exact: true }"
                 class="relative text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Dashboard</a>
              <a routerLink="/customer/banking"
                 routerLinkActive="text-primary after:content-[''] after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-0.5 after:bg-primary"
                 class="relative text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Banking</a>
              <a routerLink="/customer/transfer"
                 routerLinkActive="text-primary after:content-[''] after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-0.5 after:bg-primary"
                 class="relative text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Transfer</a>
              <a routerLink="/customer/history"
                 routerLinkActive="text-primary after:content-[''] after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-0.5 after:bg-primary"
                 class="relative text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer">History</a>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-4">
            <button (click)="showNotifications.set(true)"
                    class="p-2 text-on-surface-variant hover:text-primary transition-colors hidden sm:block relative cursor-pointer">
              <span class="material-symbols-outlined">notifications</span>
              <span class="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-white"></span>
            </button>
            <button (click)="onLogout()"
                    class="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-on-surface-variant hover:text-error transition-colors cursor-pointer">
              <span class="material-symbols-outlined text-lg">logout</span>
              Logout
            </button>

            <!-- Mobile Menu Button -->
            <button (click)="toggleMenu()" class="md:hidden p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              <span class="material-symbols-outlined">{{ isMenuOpen() ? 'close' : 'menu' }}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Notifications Modal -->
    @if (showNotifications()) {
       <app-modal title="System Alerts" (close)="showNotifications.set(false)">
         <div class="space-y-6">
           <div class="flex gap-4 p-4 bg-tertiary-container/10 rounded-xl">
             <span class="material-symbols-outlined text-tertiary">info</span>
             <div>
               <p class="font-bold text-sm text-primary">Monthly Summary Ready</p>
               <p class="text-xs text-on-surface-variant mt-1">Your ledger synchronization for the previous month is now complete.</p>
             </div>
           </div>
           <div class="flex gap-4 p-4 bg-surface-container-high rounded-xl">
             <span class="material-symbols-outlined text-on-surface-variant">security</span>
             <div>
               <p class="font-bold text-sm text-primary">Security Update</p>
               <p class="text-xs text-on-surface-variant mt-1">Multi-factor authentication is active on your account.</p>
             </div>
           </div>
         </div>
       </app-modal>
    }

    <!-- Mobile Menu Drawer (Outside sticky nav for perfect stacking and opacity) -->
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
  isMenuOpen = signal(false);
  showNotifications = signal(false);

  toggleMenu(): void {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  onLogout(): void {
    this.authService.logout();
  }
}
