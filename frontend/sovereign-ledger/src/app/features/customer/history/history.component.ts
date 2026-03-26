import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { TransactionService, Transaction } from '../../../core/services/transaction.service';
import { RouterLink } from '@angular/router';

import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
  selector: 'app-history',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NavbarComponent, FooterComponent, RouterLink, BadgeComponent, CardComponent],
  templateUrl: './history.component.html',
})
export class HistoryComponent {
  private readonly transactionService = inject(TransactionService);

  allTransactions = this.transactionService.getAllTransactions();
  searchQuery = signal('');
  currentPage = signal(1);
  readonly pageSize = 5;

  filteredTransactions = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.allTransactions;
    return this.allTransactions.filter(
      tx => tx.description.toLowerCase().includes(query)
        || tx.id.toLowerCase().includes(query)
        || tx.category.toLowerCase().includes(query)
    );
  });

  paginatedTransactions = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredTransactions().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.ceil(this.filteredTransactions().length / this.pageSize));

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getAmountClass(tx: Transaction): string {
    if (tx.status === 'declined') return 'text-outline line-through';
    return tx.type === 'credit' ? 'text-on-tertiary-fixed-variant' : 'text-on-surface';
  }

  formatAmount(tx: Transaction): string {
    const abs = Math.abs(tx.amount);
    const formatted = abs.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
    if (tx.status === 'declined') return formatted;
    return tx.type === 'credit' ? `+ ${formatted}` : `- ${formatted}`;
  }
}
