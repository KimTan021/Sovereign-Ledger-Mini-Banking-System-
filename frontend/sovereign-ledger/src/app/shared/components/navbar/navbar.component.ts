import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo & Desktop Navigation -->
          <div class="flex items-center gap-8">
            <a routerLink="/customer/dashboard" class="text-xl font-black text-primary font-headline tracking-tight">Sovereign Ledger</a>
            <div class="hidden md:flex items-center gap-6">
              <a routerLink="/customer/dashboard"
                 routerLinkActive="text-primary after:content-[''] after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-0.5 after:bg-primary"
                 [routerLinkActiveOptions]="{ exact: true }"
                 class="relative text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Dashboard</a>
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
            <button class="p-2 text-on-surface-variant hover:text-primary transition-colors hidden sm:block">
              <span class="material-symbols-outlined">notifications</span>
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

    <!-- Mobile Menu Drawer (Outside sticky nav for perfect stacking and opacity) -->
    @if (isMenuOpen()) {
      <div class="md:hidden fixed inset-0 z-[9999] bg-white flex flex-col p-6 animate-in slide-in-from-top duration-300" style="background-color: white !important;">
        <div class="flex justify-between items-center mb-10">
          <span class="text-xl font-black text-primary font-headline">Sovereign Ledger</span>
          <button (click)="toggleMenu()" class="p-2 text-on-surface-variant cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="flex flex-col gap-6 text-xl font-bold">
          <a routerLink="/customer/dashboard" (click)="toggleMenu()" class="text-on-surface hover:text-primary transition-colors cursor-pointer">Dashboard</a>
          <a routerLink="/customer/transfer" (click)="toggleMenu()" class="text-on-surface hover:text-primary transition-colors cursor-pointer">Transfer</a>
          <a routerLink="/customer/history" (click)="toggleMenu()" class="text-on-surface hover:text-primary transition-colors cursor-pointer">History</a>
          <hr class="border-outline-variant/10">
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

  toggleMenu(): void {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  onLogout(): void {
    this.authService.logout();
  }
}
