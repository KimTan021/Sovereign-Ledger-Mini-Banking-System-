import { Injectable } from '@angular/core';

export type TransactionStatus = 'completed' | 'pending' | 'declined';
export type TransactionType = 'debit' | 'credit';

export interface Transaction {
  id: string;
  date: string;
  time: string;
  description: string;
  category: string;
  icon: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {

  private readonly transactions: Transaction[] = [
    {
      id: 'SL-99283-01', date: 'Oct 24, 2023', time: '09:41 AM',
      description: 'Apple Store – Fifth Ave', category: 'Electronics',
      icon: 'shopping_bag', type: 'debit', status: 'completed', amount: -2499.00,
    },
    {
      id: 'SL-88120-44', date: 'Oct 22, 2023', time: '02:15 PM',
      description: 'Corporate Salary Deposit', category: 'Income',
      icon: 'payments', type: 'credit', status: 'completed', amount: 8500.00,
    },
    {
      id: 'SL-77001-92', date: 'Oct 21, 2023', time: '11:00 AM',
      description: 'Le Bernardin NYC', category: 'Dining',
      icon: 'restaurant', type: 'debit', status: 'completed', amount: -482.15,
    },
    {
      id: 'SL-66290-18', date: 'Oct 18, 2023', time: '03:22 PM',
      description: 'Delta Airlines', category: 'Travel',
      icon: 'flight_takeoff', type: 'debit', status: 'completed', amount: -1120.00,
    },
    {
      id: 'SL-11234-90', date: 'Oct 20, 2023', time: '06:45 PM',
      description: 'Ritz-Carlton Tokyo', category: 'Travel',
      icon: 'hotel', type: 'debit', status: 'declined', amount: -850.00,
    },
    {
      id: 'SL-55443-12', date: 'Oct 19, 2023', time: '10:12 AM',
      description: 'Consolidated Edison Inc', category: 'Utilities',
      icon: 'bolt', type: 'debit', status: 'completed', amount: -114.20,
    },
  ];

  private readonly adminAuditLog = [
    {
      title: 'External Wire Transfer', time: '2m ago',
      detail: 'From: Account ****4410', amount: '+$50,000.00',
      dotColor: 'bg-on-tertiary-container', amountColor: 'text-on-tertiary-fixed-variant',
    },
    {
      title: 'Internal Transfer', time: '15m ago',
      detail: 'User SL-1102 to SL-9921', amount: '-$1,200.00',
      dotColor: 'bg-primary', amountColor: 'text-secondary',
    },
    {
      title: 'Security Exception', time: '42m ago',
      detail: 'Login attempt from unknown IP', amount: 'Flagged: Stockholm, SE',
      dotColor: 'bg-error', amountColor: 'text-on-error-container', isError: true,
    },
    {
      title: 'Asset Liquidation', time: '1h ago',
      detail: 'Auto-rebalance triggered', amount: '-$4,105.00',
      dotColor: 'bg-on-surface-variant', amountColor: 'text-secondary', faded: true,
    },
  ];

  getRecentTransactions(count = 4): Transaction[] {
    return this.transactions.slice(0, count);
  }

  getAllTransactions(): Transaction[] {
    return this.transactions;
  }

  getAdminAuditLog() {
    return this.adminAuditLog;
  }
}
