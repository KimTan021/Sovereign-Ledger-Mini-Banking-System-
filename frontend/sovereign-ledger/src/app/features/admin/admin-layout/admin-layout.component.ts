import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- Sidebar Overlay (Mobile) -->
    @if (isSidebarVisible()) {
      <div (click)="toggleSidebar()"
           class="lg:hidden fixed inset-0 bg-surface/60 backdrop-blur-sm z-40 animate-in fade-in duration-300">
      </div>
    }

    <!-- Side Navigation Bar -->
    <aside 
      class="h-screen w-64 fixed left-0 top-0 flex flex-col bg-surface-container-low text-sm font-semibold z-50 transition-transform duration-300 ease-in-out lg:translate-x-0"
      [class.translate-x-0]="isSidebarVisible()"
      [class.-translate-x-full]="!isSidebarVisible()">
      <!-- Header -->
      <div class="p-6 flex flex-col gap-1">
        <div class="flex items-center justify-between">
          <span class="text-xl font-black text-primary font-headline">Admin Portal</span>
          <button (click)="toggleSidebar()" class="lg:hidden p-1 text-on-surface-variant">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="flex items-center gap-3 mt-4">
          <div class="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary text-xs font-bold shadow-sm">
            {{ isSuperAdmin() ? 'SA' : 'SO' }}
          </div>
          <div>
            <p class="text-on-surface font-bold leading-tight truncate max-w-[140px]">{{ isSuperAdmin() ? 'Super Admin' : 'System Oversight' }}</p>
            <p class="text-xs text-on-surface-variant font-normal">Authority Level {{ isSuperAdmin() ? 5 : 4 }}</p>
          </div>
        </div>
      </div>
      <!-- Navigation Links -->
      <nav class="flex flex-col gap-2 p-4 flex-grow overflow-y-auto">
        <a routerLink="/admin"
           routerLinkActive="bg-surface-container-lowest text-primary shadow-ambient"
           [routerLinkActiveOptions]="{ exact: true }"
           (click)="closeSidebarOnMobile()"
           class="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container rounded-2xl hover:translate-x-1 transition-transform duration-200 cursor-pointer">
          <span class="material-symbols-outlined">dashboard</span>
          <span>Overview</span>
        </a>
        <a routerLink="/admin/pending"
           routerLinkActive="bg-surface-container-lowest text-primary shadow-ambient"
           (click)="closeSidebarOnMobile()"
           class="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container rounded-2xl hover:translate-x-1 transition-transform duration-200 cursor-pointer">
          <span class="material-symbols-outlined">person_add</span>
          <span>Pending</span>
        </a>
        <a routerLink="/admin/analytics"
           routerLinkActive="bg-surface-container-lowest text-primary shadow-ambient"
           (click)="closeSidebarOnMobile()"
           class="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container rounded-2xl hover:translate-x-1 transition-transform duration-200 cursor-pointer">
          <span class="material-symbols-outlined">insights</span>
          <span>Analytics</span>
        </a>
        <a routerLink="/admin/users"
           routerLinkActive="bg-surface-container-lowest text-primary shadow-ambient"
           (click)="closeSidebarOnMobile()"
           class="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container rounded-2xl hover:translate-x-1 transition-transform duration-200 cursor-pointer">
          <span class="material-symbols-outlined">group</span>
          <span>Users</span>
        </a>
        <a routerLink="/admin/compliance"
           routerLinkActive="bg-surface-container-lowest text-primary shadow-ambient"
           (click)="closeSidebarOnMobile()"
           class="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container rounded-2xl hover:translate-x-1 transition-transform duration-200 cursor-pointer">
          <span class="material-symbols-outlined">gavel</span>
          <span>Compliance</span>
        </a>
        <a routerLink="/admin/audit"
           routerLinkActive="bg-surface-container-lowest text-primary shadow-ambient"
           (click)="closeSidebarOnMobile()"
           class="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container rounded-2xl hover:translate-x-1 transition-transform duration-200 cursor-pointer">
          <span class="material-symbols-outlined">history_edu</span>
          <span>Transactions</span>
        </a>
      </nav>
      <!-- Footer Links -->
      <div class="p-4 flex flex-col gap-2">
        <a (click)="onLogout()"
           class="flex items-center gap-3 p-3 text-on-surface-variant hover:text-error transition-colors cursor-pointer">
          <span class="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </a>
      </div>
    </aside>

    <!-- Main Content Canvas -->
    <main class="lg:ml-64 min-h-screen">
      <!-- Admin Header (Mobile/Tablet) -->
      <header class="lg:hidden flex items-center justify-between p-4 bg-surface sticky top-0 z-30">
        <div class="flex items-center gap-3">
          <button (click)="toggleSidebar()" class="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
            <span class="material-symbols-outlined">menu</span>
          </button>
          <span class="text-lg font-black text-primary font-headline">Admin Portal</span>
        </div>
      </header>
      
      <div class="p-0">
        <router-outlet />
      </div>
    </main>
  `,
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  isSidebarVisible = signal(false);
  isSuperAdmin = this.authService.isSuperAdmin;

  toggleSidebar(): void {
    this.isSidebarVisible.set(!this.isSidebarVisible());
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth < 1024) {
      this.isSidebarVisible.set(false);
    }
  }

  onLogout(): void {
    this.notificationService.shutdown();
    this.authService.logout();
  }
}
