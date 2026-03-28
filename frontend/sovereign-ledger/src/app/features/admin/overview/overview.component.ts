import { Component, inject, ChangeDetectionStrategy, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { AdminService, PendingUser, AdminStats, TopAccount, AuditLogEntry, CategoryMetric } from '../../../core/services/admin.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CurrencyPipe, DatePipe, CardComponent, BadgeComponent, RouterModule],
  templateUrl: './overview.component.html',
})
export class OverviewComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  pendingUsers = signal<PendingUser[]>([]);
  displayPendingUsers = computed(() => this.pendingUsers().slice(0, 3));

  isProcessing = signal<{ [id: number]: boolean }>({});

  systemStats = signal<AdminStats | null>(null);
  highValueAccounts = signal<TopAccount[]>([]);
  auditLog = signal<AuditLogEntry[]>([]);
  dailyVolume = signal<CategoryMetric[]>([]);
  displayAuditLogs = computed(() => this.auditLog().slice(0, 5));
  flaggedAuditCount = computed(() => this.auditLog().filter(entry => entry.error).length);
  topAccountShare = computed(() => {
    const liquidity = this.systemStats()?.totalLiquidity || 0;
    const topHoldings = this.highValueAccounts().reduce((sum, account) => sum + account.accountBalance, 0);
    return liquidity > 0 ? (topHoldings / liquidity) * 100 : 0;
  });
  recentVolumeBars = computed(() => {
    const latest = this.buildRecentDailyVolumeSeries(7);
    const max = Math.max(...latest.map(item => item.value), 1);

    return latest.map(item => ({
      label: item.category,
      height: `${Math.max(18, Math.round((item.value / max) * 100))}%`,
      value: item.value
    }));
  });
  systemStatus = computed(() => {
    if (this.flaggedAuditCount() > 0) return 'Attention Required';
    if (this.pendingUsers().length > 0) return 'Operational';
    return 'Healthy';
  });
  activeEntityBadges = computed(() => {
    const initials = this.highValueAccounts().map(account => `${account.firstName[0]}${account.lastName[0]}`);
    const badges = initials.slice(0, 3);
    const remaining = Math.max((this.systemStats()?.activeEntities || 0) - badges.length, 0);
    return { badges, remaining };
  });

  ngOnInit(): void {
    this.loadPendingUsers();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.adminService.getSystemStats().subscribe(stats => this.systemStats.set(stats));
    this.adminService.getHighValueAccounts().subscribe(accounts => this.highValueAccounts.set(accounts));
    this.adminService.getAuditLogs().subscribe(logs => this.auditLog.set(logs));
    this.adminService.getDailyVolume().subscribe(metrics => this.dailyVolume.set(metrics));
  }

  loadPendingUsers(): void {
    this.adminService.getPendingUsers(0, 5).subscribe({
      next: (response) => this.pendingUsers.set(response.content),
      error: (err) => console.error('Failed to load pending users', err)
    });
  }

  approveRequest(id: number): void {
    this.setProcessing(id, true);
    this.adminService.approveUser(id).subscribe({
      next: () => {
        this.setProcessing(id, false);
        this.loadPendingUsers();
        this.loadDashboardData(); // Refresh stats, high-value accounts, and audit log
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
        this.loadPendingUsers();
        this.loadDashboardData(); // Refresh stats after rejection too
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

  private buildRecentDailyVolumeSeries(days: number): CategoryMetric[] {
    const metricsByDate = new Map(
      this.dailyVolume().map(metric => [this.normalizeMetricDate(metric.category), metric.value])
    );

    const series: CategoryMetric[] = [];
    const today = new Date();

    for (let offset = days - 1; offset >= 0; offset--) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      const key = this.toDateKey(date);
      series.push({
        category: key,
        value: metricsByDate.get(key) ?? 0
      });
    }

    return series;
  }

  private normalizeMetricDate(raw: string): string {
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? raw : this.toDateKey(parsed);
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
