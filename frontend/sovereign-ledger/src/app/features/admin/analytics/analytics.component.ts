import { Component, ChangeDetectionStrategy, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { AdminService, AnalyticsDashboard, CategoryMetric, TopTransactor } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-analytics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, BaseChartDirective, CurrencyPipe, DecimalPipe],
  template: `
    <div class="p-12 lg:p-16 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-screen-2xl mx-auto">
      <header class="space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 class="text-3xl font-headline font-extrabold tracking-tighter text-primary">System Analytics</h1>
            <p class="text-on-surface-variant">Operational analytics with range filtering, risk trends, onboarding, and flow diagnostics.</p>
          </div>
          <div class="flex gap-2">
            @for (option of rangeOptions; track option.value) {
              <button type="button"
                      (click)="setRange(option.value)"
                      class="px-4 py-2 rounded-full text-sm font-bold border transition-colors"
                      [class]="rangeDays() === option.value ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-lowest text-primary border-outline-variant/20'">
                {{ option.label }}
              </button>
            }
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="rounded-2xl bg-surface-container-lowest p-5 shadow-ambient">
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Flagged Queue</p>
          <h2 class="mt-3 text-3xl font-headline font-bold text-error">{{ sumMetric(dashboard()?.flaggedTrend) | number:'1.0-0' }}</h2>
          <p class="mt-2 text-sm text-on-surface-variant">Failed, escalated, and review-required transactions in range.</p>
        </div>
        <div class="rounded-2xl bg-surface-container-lowest p-5 shadow-ambient">
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Net Flow</p>
          <h2 class="mt-3 text-3xl font-headline font-bold text-primary">{{ netFlowTotal() | currency:'PHP':'symbol':'1.0-0' }}</h2>
          <p class="mt-2 text-sm text-on-surface-variant">Credits minus debits across the selected period.</p>
        </div>
        <div class="rounded-2xl bg-surface-container-lowest p-5 shadow-ambient">
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Adjustments Posted</p>
          <h2 class="mt-3 text-3xl font-headline font-bold text-primary">{{ sumMetric(dashboard()?.adjustmentAnalytics) | currency:'PHP':'symbol':'1.0-0' }}</h2>
          <p class="mt-2 text-sm text-on-surface-variant">Total value of admin credits and debits in range.</p>
        </div>
        <div class="rounded-2xl bg-surface-container-lowest p-5 shadow-ambient">
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Pending Aging</p>
          <h2 class="mt-3 text-3xl font-headline font-bold text-primary">{{ dominantAgingBucket() }}</h2>
          <p class="mt-2 text-sm text-on-surface-variant">Most common approval aging bucket right now.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section class="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient h-[420px] flex flex-col">
          <h2 class="text-xl font-headline font-bold text-primary mb-4">Daily Transaction Pulse</h2>
          <div class="flex-1 relative">
            @if (isLoading()) {
              <div class="absolute inset-0 flex items-center justify-center text-on-surface-variant italic">Loading analytics…</div>
            } @else {
              <canvas baseChart [data]="dailyVolumeChart()" [options]="lineChartOptions" [type]="'line'"></canvas>
            }
          </div>
        </section>

        <section class="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient h-[420px] flex flex-col">
          <h2 class="text-xl font-headline font-bold text-primary mb-4">Net Flow Trend</h2>
          <div class="flex-1 relative">
            @if (isLoading()) {
              <div class="absolute inset-0 flex items-center justify-center text-on-surface-variant italic">Loading analytics…</div>
            } @else {
              <canvas baseChart [data]="netFlowChart()" [options]="barChartOptions" [type]="'bar'"></canvas>
            }
          </div>
        </section>

        <section class="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient h-[420px] flex flex-col">
          <h2 class="text-xl font-headline font-bold text-primary mb-4">Volume by Amount Bucket</h2>
          <div class="flex-1 relative">
            @if (isLoading()) {
              <div class="absolute inset-0 flex items-center justify-center text-on-surface-variant italic">Loading analytics…</div>
            } @else {
              <canvas baseChart [data]="amountBucketChart()" [options]="barChartOptions" [type]="'bar'"></canvas>
            }
          </div>
        </section>

        <section class="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient h-[420px] flex flex-col">
          <h2 class="text-xl font-headline font-bold text-primary mb-4">Flagged / Failed Trend</h2>
          <div class="flex-1 relative">
            @if (isLoading()) {
              <div class="absolute inset-0 flex items-center justify-center text-on-surface-variant italic">Loading analytics…</div>
            } @else {
              <canvas baseChart [data]="flaggedTrendChart()" [options]="lineChartOptions" [type]="'line'"></canvas>
            }
          </div>
        </section>

        <section class="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient h-[420px] flex flex-col">
          <h2 class="text-xl font-headline font-bold text-primary mb-4">Onboarding and Account Growth</h2>
          <div class="flex-1 relative">
            @if (isLoading()) {
              <div class="absolute inset-0 flex items-center justify-center text-on-surface-variant italic">Loading analytics…</div>
            } @else {
              <canvas baseChart [data]="growthChart()" [options]="lineChartOptions" [type]="'line'"></canvas>
            }
          </div>
        </section>

        <section class="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient h-[420px] flex flex-col">
          <h2 class="text-xl font-headline font-bold text-primary mb-4">Status and Review Mix</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <div class="relative">
              <canvas baseChart [data]="statusBreakdownChart()" [options]="doughnutChartOptions" [type]="'doughnut'"></canvas>
            </div>
            <div class="relative">
              <canvas baseChart [data]="complianceChart()" [options]="doughnutChartOptions" [type]="'doughnut'"></canvas>
            </div>
          </div>
        </section>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section class="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
          <h2 class="text-xl font-headline font-bold text-primary mb-5">Top User Transactors</h2>
          <div class="space-y-4">
            @for (user of dashboard()?.topUserTransactors || []; track user.id) {
              <div class="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white">
                <div>
                  <p class="font-bold text-primary">{{ user.label }}</p>
                  <p class="text-xs text-on-surface-variant">{{ user.transactionCount }} transactions</p>
                </div>
                <p class="font-headline font-bold text-on-surface">{{ user.totalAmount | currency:'PHP':'symbol':'1.2-2' }}</p>
              </div>
            } @empty {
              <p class="text-on-surface-variant italic">No transaction activity in range.</p>
            }
          </div>
        </section>

        <section class="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
          <h2 class="text-xl font-headline font-bold text-primary mb-5">Top Account Transactors</h2>
          <div class="space-y-4">
            @for (account of dashboard()?.topAccountTransactors || []; track account.id) {
              <div class="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white">
                <div>
                  <p class="font-bold text-primary font-mono">{{ account.label }}</p>
                  <p class="text-xs text-on-surface-variant">{{ account.transactionCount }} transactions</p>
                </div>
                <p class="font-headline font-bold text-on-surface">{{ account.totalAmount | currency:'PHP':'symbol':'1.2-2' }}</p>
              </div>
            } @empty {
              <p class="text-on-surface-variant italic">No transaction activity in range.</p>
            }
          </div>
        </section>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <section class="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
          <h2 class="text-xl font-headline font-bold text-primary mb-5">Approval Aging</h2>
          <div class="space-y-3 px-2">
            @for (item of dashboard()?.approvalAging || []; track item.category) {
              <div class="flex items-center justify-between py-2 border-b border-outline-variant/5 last:border-0">
                <p class="text-sm font-medium text-on-surface">{{ item.category }}</p>
                <p class="font-bold text-primary">{{ item.value | number:'1.0-0' }}</p>
              </div>
            }
          </div>
        </section>

        <section class="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
          <h2 class="text-xl font-headline font-bold text-primary mb-5">Adjustment Mix</h2>
          <div class="space-y-3 px-2">
            @for (item of dashboard()?.adjustmentAnalytics || []; track item.category) {
              <div class="flex items-center justify-between py-2 border-b border-outline-variant/5 last:border-0">
                <p class="text-sm font-medium text-on-surface">{{ item.category }}</p>
                <p class="font-bold text-primary">{{ item.value | currency:'PHP':'symbol':'1.2-2' }}</p>
              </div>
            }
          </div>
        </section>

        <section class="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
          <h2 class="text-xl font-headline font-bold text-primary mb-5">Transaction Demographics</h2>
          <div class="space-y-3 px-2">
            @for (item of dashboard()?.transactionDistribution || []; track item.category) {
              <div class="flex items-center justify-between py-2 border-b border-outline-variant/5 last:border-0">
                <p class="text-sm font-medium text-on-surface">{{ item.category }}</p>
                <p class="font-bold text-primary">{{ item.value | number:'1.0-0' }}</p>
              </div>
            }
          </div>
        </section>
      </div>
    </div>
  `
})
export class AnalyticsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly notificationService = inject(NotificationService);

  readonly rangeOptions = [
    { label: '7D', value: 7 },
    { label: '30D', value: 30 },
    { label: '90D', value: 90 },
  ];

  rangeDays = signal(30);
  dashboard = signal<AnalyticsDashboard | null>(null);
  isLoading = signal(true);

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: { tension: 0.35, borderWidth: 3 },
      point: { radius: 0, hitRadius: 10, hoverRadius: 5 }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#e0e3e5' } }
    },
    plugins: { legend: { display: false } }
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#e0e3e5' } }
    },
    plugins: { legend: { display: false } }
  };

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '66%',
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } }
    }
  };

  dailyVolumeChart = computed(() => this.toLineChart(this.dashboard()?.dailyVolume || [], 'Tx Volume', '#002045', 'rgba(0, 32, 69, 0.08)'));
  netFlowChart = computed(() => this.toBarChart(this.dashboard()?.netFlow || [], 'Net Flow', '#00b47d'));
  amountBucketChart = computed(() => this.toBarChart(this.dashboard()?.volumeByAmount || [], 'Volume by Amount', '#505f76'));
  flaggedTrendChart = computed(() => this.toLineChart(this.dashboard()?.flaggedTrend || [], 'Flagged', '#b42318', 'rgba(180, 35, 24, 0.10)'));
  growthChart = computed(() => this.toLineChart(this.dashboard()?.accountGrowth || [], 'Growth', '#4e79a7', 'rgba(78, 121, 167, 0.10)'));
  statusBreakdownChart = computed(() => this.toDoughnutChart([
    ...(this.dashboard()?.accountStatusBreakdown || []).map(item => ({ ...item, category: `Account ${item.category}` })),
    ...(this.dashboard()?.userStatusBreakdown || []).map(item => ({ ...item, category: `User ${item.category}` })),
  ]));
  complianceChart = computed(() => this.toDoughnutChart(this.dashboard()?.complianceReviewAnalytics || []));

  netFlowTotal = computed(() => (this.dashboard()?.netFlow || []).reduce((sum, item) => sum + item.value, 0));
  dominantAgingBucket = computed(() => {
    const items = this.dashboard()?.approvalAging || [];
    if (items.length === 0) return 'N/A';
    return [...items].sort((a, b) => b.value - a.value)[0].category;
  });

  private readonly refreshOnDataChange = effect(() => {
    if (this.notificationService.dataVersion() === 0) {
      return;
    }
    this.loadDashboard();
  });

  ngOnInit() {
    this.loadDashboard();
  }

  setRange(days: number): void {
    this.rangeDays.set(days);
    this.loadDashboard();
  }

  sumMetric(metrics?: CategoryMetric[]): number {
    return (metrics || []).reduce((sum, item) => sum + item.value, 0);
  }

  private loadDashboard(): void {
    this.isLoading.set(true);
    this.adminService.getAnalyticsDashboard(this.rangeDays()).subscribe({
      next: data => {
        this.dashboard.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  private toLineChart(metrics: CategoryMetric[], label: string, borderColor: string, backgroundColor: string): ChartData<'line'> {
    return {
      labels: metrics.map(m => m.category),
      datasets: [{
        data: metrics.map(m => m.value),
        label,
        borderColor,
        backgroundColor,
        fill: true,
      }]
    };
  }

  private toBarChart(metrics: CategoryMetric[], label: string, backgroundColor: string): ChartData<'bar'> {
    return {
      labels: metrics.map(m => m.category),
      datasets: [{
        data: metrics.map(m => m.value),
        label,
        backgroundColor,
        borderRadius: 8,
      }]
    };
  }

  private toDoughnutChart(metrics: CategoryMetric[]): ChartData<'doughnut'> {
    return {
      labels: metrics.map(m => m.category),
      datasets: [{
        data: metrics.map(m => m.value),
        backgroundColor: ['#002045', '#4e79a7', '#59a14f', '#f28e2b', '#e15759', '#76b7b2', '#edc948'],
        borderWidth: 0,
      }]
    };
  }
}
