import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AdminService, CategoryMetric } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-analytics',
  changeDetection: ChangeDetectionStrategy.OnPush,  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header class="space-y-1 block">
        <h1 class="text-3xl font-headline font-extrabold tracking-tighter text-primary">System Analytics</h1>
        <p class="text-on-surface-variant">Deep-dive financial and usage metrics</p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Daily Volume Line Chart -->
        <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-ambient h-[450px] flex flex-col">
          <h2 class="text-xl font-headline font-bold text-primary mb-4">Daily Transaction Pulse (30 Days)</h2>
          <div class="flex-1 w-full relative">
            @if (isLoadingVolume()) {
              <div class="absolute inset-0 flex items-center justify-center text-on-surface-variant text-sm font-bold animate-pulse">
                Building Chart Coordinates...
              </div>
            } @else if (lineChartData().labels?.length) {
              <canvas baseChart
                [data]="lineChartData()"
                [options]="lineChartOptions"
                [type]="lineChartType">
              </canvas>
            } @else {
              <div class="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant opacity-60">
                <span class="material-symbols-outlined text-4xl mb-2">monitoring</span>
                <p class="text-sm font-bold">No volume data in the last 30 days</p>
              </div>
            }
          </div>
        </div>

        <!-- Category Doughnut Chart -->
        <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-ambient h-[450px] flex flex-col">
          <h2 class="text-xl font-headline font-bold text-primary mb-4">Activity Demographics</h2>
          <div class="flex-1 w-full relative">
            @if (isLoadingDistrib()) {
              <div class="absolute inset-0 flex items-center justify-center text-on-surface-variant text-sm font-bold animate-pulse">
                Mapping Distributive Proportions...
              </div>
            } @else if (doughnutChartData().labels?.length) {
              <canvas baseChart
                [data]="doughnutChartData()"
                [options]="doughnutChartOptions"
                [type]="doughnutChartType">
              </canvas>
            } @else {
              <div class="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant opacity-60">
                <span class="material-symbols-outlined text-4xl mb-2">pie_chart</span>
                <p class="text-sm font-bold">No active transactions to categorise</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class AnalyticsComponent implements OnInit {
  private adminService = inject(AdminService);

  lineChartType: 'line' = 'line';
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: { tension: 0.4, borderWidth: 3 },
      point: { radius: 0, hitRadius: 10, hoverRadius: 6 }
    },
    scales: {
      x: { grid: { display: false } },
      y: { border: { dash: [5, 5] }, grid: { color: '#e0e3e5' } }
    },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#002045', padding: 12, cornerRadius: 8, titleFont: { family: 'Inter', size: 13 }, bodyFont: { family: 'Inter', size: 14, weight: 'bold' } }
    }
  };
  lineChartData = signal<ChartData<'line'>>({ labels: [], datasets: [] });

  doughnutChartType: 'doughnut' = 'doughnut';
  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { family: 'Inter', size: 12 } } },
      tooltip: { backgroundColor: '#002045', padding: 12, cornerRadius: 8 }
    }
  };
  doughnutChartData = signal<ChartData<'doughnut'>>({ labels: [], datasets: [] });

  isLoadingVolume = signal(true);
  isLoadingDistrib = signal(true);

  ngOnInit() {
    this.adminService.getDailyVolume().subscribe({
      next: (metrics) => {
        const labels = metrics.map(m => m.category);
        const data = metrics.map(m => m.value);
        this.lineChartData.set({
          labels,
          datasets: [{
            data,
            label: 'Tx Volume',
            borderColor: '#002045',
            backgroundColor: 'rgba(0, 32, 69, 0.05)',
            fill: true
          }]
        });
        this.isLoadingVolume.set(false);
      },
      error: () => this.isLoadingVolume.set(false)
    });

    this.adminService.getTransactionDistribution().subscribe({
      next: (metrics) => {
        const labels = metrics.map(m => m.category.toUpperCase());
        const data = metrics.map(m => m.value);
        this.doughnutChartData.set({
          labels,
          datasets: [{
            data,
            backgroundColor: ['#002045', '#505f76', '#00b47d', '#86a0cd', '#4edea3'],
            borderWidth: 0,
            hoverOffset: 4
          }]
        });
        this.isLoadingDistrib.set(false);
      },
      error: () => this.isLoadingDistrib.set(false)
    });
  }
}
