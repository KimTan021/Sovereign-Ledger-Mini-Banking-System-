import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- Side Navigation Bar -->
    <aside class="h-screen w-64 fixed left-0 top-0 flex flex-col bg-surface-container-low text-sm font-semibold z-40">
      <!-- Header -->
      <div class="p-6 flex flex-col gap-1">
        <span class="text-lg font-black text-primary font-headline">Admin Portal</span>
        <div class="flex items-center gap-3 mt-4">
          <div class="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary text-xs font-bold shadow-sm">SO</div>
          <div>
            <p class="text-on-surface font-bold leading-tight">System Oversight</p>
            <p class="text-xs text-on-surface-variant font-normal">Authority Level 4</p>
          </div>
        </div>
      </div>
      <!-- Navigation Links -->
      <nav class="flex flex-col gap-2 p-4 flex-grow">
        <a routerLink="/admin"
           routerLinkActive="bg-surface-container-lowest text-primary shadow-sm"
           [routerLinkActiveOptions]="{ exact: true }"
           class="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container rounded-xl hover:translate-x-1 transition-transform duration-200 cursor-pointer">
          <span class="material-symbols-outlined">dashboard</span>
          <span>Overview</span>
        </a>
        <a class="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container rounded-xl hover:translate-x-1 transition-transform duration-200 cursor-pointer">
          <span class="material-symbols-outlined">insights</span>
          <span>Analytics</span>
        </a>
        <a class="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container rounded-xl hover:translate-x-1 transition-transform duration-200 cursor-pointer">
          <span class="material-symbols-outlined">group</span>
          <span>Users</span>
        </a>
        <a class="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container rounded-xl hover:translate-x-1 transition-transform duration-200 cursor-pointer">
          <span class="material-symbols-outlined">gavel</span>
          <span>Compliance</span>
        </a>
        <a class="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container rounded-xl hover:translate-x-1 transition-transform duration-200 cursor-pointer">
          <span class="material-symbols-outlined">history_edu</span>
          <span>Audit</span>
        </a>
        <div class="mt-6">
          <button class="w-full py-3 primary-gradient text-white rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
            Generate Report
          </button>
        </div>
      </nav>
      <!-- Footer Links -->
      <div class="p-4 border-t border-outline-variant/10 flex flex-col gap-2">
        <a class="flex items-center gap-3 p-3 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
          <span class="material-symbols-outlined">help_outline</span>
          <span>Support</span>
        </a>
        <a (click)="onLogout()"
           class="flex items-center gap-3 p-3 text-on-surface-variant hover:text-error transition-colors cursor-pointer">
          <span class="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </a>
      </div>
    </aside>

    <!-- Main Content Canvas -->
    <main class="ml-64 min-h-screen">
      <router-outlet />
    </main>
  `,
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);

  onLogout(): void {
    this.authService.logout();
  }
}
