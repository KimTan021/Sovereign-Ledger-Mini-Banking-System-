import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-surface-container-lowest/70 backdrop-blur-xl sticky top-0 z-50 shadow-sm shadow-primary/5">
      <div class="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
        <div class="flex items-center gap-8">
          <span class="text-xl font-bold tracking-tighter text-primary font-headline">Sovereign Ledger</span>
          <div class="hidden md:flex gap-6 text-sm font-medium tracking-tight font-headline">
            <a routerLink="/customer/dashboard"
               routerLinkActive="text-primary border-b-2 border-primary pb-1"
               class="text-on-surface-variant hover:text-primary transition-colors">Dashboard</a>
            <a routerLink="/customer/transfer"
               routerLinkActive="text-primary border-b-2 border-primary pb-1"
               class="text-on-surface-variant hover:text-primary transition-colors">Transfer</a>
            <a routerLink="/customer/history"
               routerLinkActive="text-primary border-b-2 border-primary pb-1"
               class="text-on-surface-variant hover:text-primary transition-colors">History</a>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <button class="p-2 hover:bg-surface-container-low rounded-lg transition-all active:scale-95"
                    aria-label="Notifications">
              <span class="material-symbols-outlined text-on-surface-variant">notifications</span>
            </button>
            <button class="p-2 hover:bg-surface-container-low rounded-lg transition-all active:scale-95"
                    aria-label="Settings">
              <span class="material-symbols-outlined text-on-surface-variant">settings</span>
            </button>
          </div>
          <button (click)="onLogout()"
                  class="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-all"
                  aria-label="Logout">
            <span class="material-symbols-outlined text-lg">logout</span>
            <span class="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
      <div class="bg-outline-variant/10 h-px w-full"></div>
    </nav>
  `,
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);

  onLogout(): void {
    this.authService.logout();
  }
}
