import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-between px-6 py-4 bg-surface-container-low/30 rounded-xl mt-6">
      <div class="flex items-center gap-2">
        <p class="text-xs text-on-surface-variant font-medium">
          Showing <span class="text-primary font-bold">{{ startRange() }}</span> to 
          <span class="text-primary font-bold">{{ endRange() }}</span> of 
          <span class="text-primary font-bold">{{ totalElements }}</span> results
        </p>
      </div>

      <div class="flex items-center gap-1">
        <!-- Previous Button -->
        <button 
          (click)="onPageChange(currentPage - 1)"
          [disabled]="currentPage === 0"
          class="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none group">
          <span class="material-symbols-outlined text-sm group-active:scale-90 transition-transform">chevron_left</span>
        </button>

        <!-- Page Numbers -->
        <div class="flex items-center gap-1 mx-2">
          @for (page of visiblePages(); track page) {
            @if (page === -1) {
              <span class="px-2 text-on-surface-variant opacity-40">...</span>
            } @else {
              <button 
                (click)="onPageChange(page)"
                [class]="page === currentPage 
                  ? 'bg-primary text-on-primary shadow-sm' 
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'"
                class="w-8 h-8 rounded-lg text-xs font-bold transition-all active:scale-90">
                {{ page + 1 }}
              </button>
            }
          }
        </div>

        <!-- Next Button -->
        <button 
          (click)="onPageChange(currentPage + 1)"
          [disabled]="currentPage >= totalPages - 1"
          class="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none group">
          <span class="material-symbols-outlined text-sm group-active:scale-90 transition-transform">chevron_right</span>
        </button>
      </div>
    </div>
  `,
})
export class PaginationComponent {
  @Input() totalElements = 0;
  @Input() totalPages = 0;
  @Input() currentPage = 0;
  @Input() pageSize = 10;

  @Output() pageChange = new EventEmitter<number>();

  startRange = computed(() => this.totalElements === 0 ? 0 : (this.currentPage * this.pageSize) + 1);
  endRange = computed(() => Math.min((this.currentPage + 1) * this.pageSize, this.totalElements));

  visiblePages = computed(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 0; i < this.totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      
      let start = Math.max(1, this.currentPage - 1);
      let end = Math.min(this.totalPages - 2, this.currentPage + 1);
      
      if (this.currentPage <= 2) end = 3;
      if (this.currentPage >= this.totalPages - 3) start = this.totalPages - 4;
      
      if (start > 1) pages.push(-1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < this.totalPages - 2) pages.push(-1);
      
      pages.push(this.totalPages - 1);
    }
    return pages;
  });

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}
