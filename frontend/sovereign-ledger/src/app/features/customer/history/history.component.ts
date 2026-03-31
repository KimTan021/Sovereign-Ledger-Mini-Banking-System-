import { Component, inject, signal, computed, ChangeDetectionStrategy, ElementRef, effect, viewChild } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { TransactionService, Transaction } from '../../../core/services/transaction.service';
import { AccountService, Account } from '../../../core/services/account.service';
import { RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    NavbarComponent, 
    FooterComponent, 
    RouterLink, 
    BadgeComponent, 
    CardComponent, 
    CurrencyPipe,
    DecimalPipe,
    ModalComponent
  ],
  templateUrl: './history.component.html',
})
export class HistoryComponent {
  private readonly transactionService = inject(TransactionService);
  private readonly accountService = inject(AccountService);
  private readonly historyTop = viewChild<ElementRef<HTMLElement>>('historyTop');

  allTransactions = toSignal(this.transactionService.getAllTransactions(), { initialValue: [] });
  accounts = toSignal(this.accountService.getCustomerAccounts(), { initialValue: [] });
  
  searchQuery = signal('');
  typeFilter = signal<'all' | 'credit' | 'debit'>('all');
  dateFilter = signal<'all' | '30' | '90' | '180'>('all');
  accountIdFilter = signal<string>('all');
  
  selectedTransaction = signal<Transaction | null>(null);
  
  currentPage = signal(1);
  readonly pageSize = 10;

  filteredTransactions = computed(() => {
    let source = this.allTransactions();
    
    // Account filtering
    const accId = this.accountIdFilter();
    if (accId !== 'all') {
      source = source.filter(tx => tx.accountId === accId);
    }
    
    // Search query filter
    const query = this.searchQuery().toLowerCase();
    if (query) {
      source = source.filter(tx => 
        tx.description.toLowerCase().includes(query) || 
        tx.id.toLowerCase().includes(query) || 
        tx.category.toLowerCase().includes(query)
      );
    }

    // Type filter
    const type = this.typeFilter();
    if (type !== 'all') {
      source = source.filter(tx => tx.type === type);
    }

    // Date filter (Mock logic for time-based filtering)
    const dateRange = this.dateFilter();
    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      source = source.filter(tx => new Date(tx.date) >= cutoff);
    }

    return source;
  });

  paginatedTransactions = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredTransactions().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.ceil(this.filteredTransactions().length / this.pageSize));
  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));
  
  aggregates = computed(() => this.transactionService.getAggregates(this.filteredTransactions()));

  private readonly clampCurrentPage = effect(() => {
    const totalPages = this.totalPages();
    const currentPage = this.currentPage();

    if (totalPages === 0 && currentPage !== 1) {
      this.currentPage.set(1);
      return;
    }

    if (totalPages > 0 && currentPage > totalPages) {
      this.currentPage.set(totalPages);
    }
  });

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
  }

  setTypeFilter(type: 'all' | 'credit' | 'debit'): void {
    this.typeFilter.set(type);
    this.currentPage.set(1);
  }

  setDateFilter(range: 'all' | '30' | '90' | '180'): void {
    this.dateFilter.set(range);
    this.currentPage.set(1);
  }

  setAccountIdFilter(id: string): void {
    this.accountIdFilter.set(id);
    this.currentPage.set(1);
  }

  exportCSV(): void {
    this.transactionService.exportToCSV(this.filteredTransactions());
  }

  badgeStatus(value: string): string {
    return (value || 'neutral').toLowerCase();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      requestAnimationFrame(() => {
        this.historyTop()?.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      });
    }
  }
}
