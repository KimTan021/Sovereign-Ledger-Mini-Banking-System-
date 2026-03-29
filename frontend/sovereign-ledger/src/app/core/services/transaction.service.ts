import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

export type TransactionStatus = 'completed' | 'pending' | 'declined' | 'reviewed' | 'escalated';
export type TransactionType = 'debit' | 'credit';

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  time: string;
  description: string;
  category: string;
  icon: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  targetAccountNumber?: string;
  targetAccountName?: string;
  reviewNote?: string;
  logs?: string;
}

export interface BackendTransactionResponse {
  transactionId: number;
  accountId: number;
  userId?: number;
  transactionTime: string;
  transactionType: string;
  transactionAmount: number;
  transactionStatus: string;
  transactionDescription: string;
  targetAccountNumber?: string;
  targetAccountName?: string;
  reviewNote?: string;
  logs?: string;
}

export interface TransferPayload {
  sourceAccountId: number;
  targetAccountNumber: string;
  transAmount: number;
  description: string;
}

export interface InternalTransferPayload {
  sourceAccountId: number;
  receivingAccountId: number;
  transAmount: number;
  logs: string;
  transactionDescription: string;
}

export interface CashTransactionPayload {
  accountId: number;
  transAmount: number;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly apiUrl = 'http://localhost:8080/transactions';

  private readonly adminAuditLog = [
    {
      title: 'External Wire Transfer', time: '2m ago',
      detail: 'From: Account ****4410', amount: '+₱50,000.00',
      dotColor: 'bg-on-tertiary-container', amountColor: 'text-on-tertiary-fixed-variant',
    },
    {
      title: 'Internal Transfer', time: '15m ago',
      detail: 'User SL-1102 to SL-9921', amount: '-₱1,200.00',
      dotColor: 'bg-primary', amountColor: 'text-secondary',
    },
    {
      title: 'Security Exception', time: '42m ago',
      detail: 'Login attempt from unknown IP', amount: 'Flagged: Stockholm, SE',
      dotColor: 'bg-error', amountColor: 'text-on-error-container', isError: true,
    },
    {
      title: 'Asset Liquidation', time: '1h ago',
      detail: 'Auto-rebalance triggered', amount: '-₱4,105.00',
      dotColor: 'bg-on-surface-variant', amountColor: 'text-secondary', faded: true,
    },
  ];

  /* Helper to format backend ISO dates neatly with categorization logic */
  private mapBackendToFrontend(beTx: BackendTransactionResponse): Transaction {
    let amt = beTx.transactionAmount;
    // Map backend type withdrawal to negative amount for frontend logic
    if (beTx.transactionType && beTx.transactionType.toLowerCase() === 'withdrawal' || beTx.transactionType.toLowerCase() === 'debit') {
      amt = -Math.abs(amt);
    }
    
    // Categorization logic based on description
    const desc = (beTx.transactionDescription || '').toLowerCase();
    let category = 'General';
    let icon = 'sync_alt';
    let description = beTx.transactionDescription || 'Transaction';
    const logs = beTx.logs || '';
    const normalizedStatus = ((beTx.transactionStatus || 'completed').toLowerCase()) as TransactionStatus;

    if (desc.includes('meralco') || desc.includes('water') || desc.includes('bill') || desc.includes('rent') || desc.includes('utilities')) {
       category = 'Bills & Utilities';
       icon = 'account_balance';
    } else if (desc.includes('deposit')) {
       category = 'Deposits';
       icon = 'south_west';
    } else if (desc.includes('withdraw')) {
       category = 'Withdrawals';
       icon = 'north_east';
    } else if (desc.includes('internal')) {
       category = 'Internal Transfer';
       icon = 'swap_horiz';
    } else if (desc.includes('admin adjustment') || logs.toLowerCase().includes('administrative')) {
       category = 'Account Adjustment';
       icon = 'admin_panel_settings';
       description = beTx.transactionType?.toLowerCase() === 'credit'
        ? 'Administrative credit'
        : 'Administrative debit';
    } else if (desc.includes('grab') || desc.includes('travel') || desc.includes('flight') || desc.includes('cebu') || desc.includes('leisure')) {
       category = 'Travel & Leisure';
       icon = 'flight_takeoff';
    } else if (desc.includes('apple') || desc.includes('microsoft') || desc.includes('gadget') || desc.includes('technology')) {
       category = 'Technology';
       icon = 'devices';
    } else if (desc.includes('food') || desc.includes('dining') || desc.includes('restaurant') || desc.includes('starbucks')) {
       category = 'Food & Dining';
       icon = 'restaurant';
    } else if (desc.includes('transfer') || desc.includes('payment')) {
       category = 'Payments';
       icon = 'payments';
    }

    // Attempt format date if ISO, else just use directly
    let parsedDate = 'Unknown Date';
    let parsedTime = 'Unknown Time';
    try {
       const dt = new Date(beTx.transactionTime);
       parsedDate = dt.toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'});
       parsedTime = dt.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'});
    } catch(e) {}

    return {
      id: `TX-${beTx.transactionId}`,
      accountId: beTx.accountId.toString(),
      date: parsedDate,
      time: parsedTime,
      description,
      category: category,
      icon: icon,
      type: (amt < 0) ? 'debit' : 'credit',
      status: normalizedStatus,
      amount: Math.abs(amt),
      targetAccountNumber: beTx.targetAccountNumber,
      targetAccountName: beTx.targetAccountName,
      reviewNote: beTx.reviewNote,
      logs: logs
    };
  }

  getAggregates(transactions: Transaction[]) {
    const totalInflow = transactions
      .filter(t => t.type === 'credit' && t.status !== 'declined')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalOutflow = transactions
      .filter(t => t.type === 'debit' && t.status !== 'declined')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryMap: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'debit' && t.status !== 'declined') {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      }
    });

    const categories = Object.keys(categoryMap).map(name => ({
      name,
      amount: categoryMap[name],
      percentage: totalOutflow > 0 ? (categoryMap[name] / totalOutflow) * 100 : 0
    })).sort((a,b) => b.amount - a.amount);

    return { totalInflow, totalOutflow, categories };
  }

  exportToCSV(transactions: Transaction[]): void {
    const headers = ['ID', 'Account ID', 'Date', 'Time', 'Description', 'Category', 'Type', 'Status', 'Amount', 'Recipient Account', 'Recipient Name', 'Review Note'];
    const rows = transactions.map(t => [
      t.id, t.accountId, t.date, t.time, t.description, t.category, t.type, t.status, t.amount, t.targetAccountNumber || '', t.targetAccountName || '', t.reviewNote || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getRecentTransactions(count = 4): Observable<Transaction[]> {
    const user = this.authService.user();
    if (!user || !user.userId) return of([]);

    return this.notificationService.watch(() =>
      this.http.get<BackendTransactionResponse[]>(`${this.apiUrl}/${user.userId}/transactions`).pipe(
        map(txs => {
           const sorted = txs.sort((a, b) => new Date(b.transactionTime).getTime() - new Date(a.transactionTime).getTime());
           return sorted.slice(0, count).map(this.mapBackendToFrontend);
        }),
        catchError(err => {
          console.error('Failed to fetch recent transactions:', err);
          return of([]);
        })
      )
    );
  }

  getAllTransactions(): Observable<Transaction[]> {
    const user = this.authService.user();
    if (!user || !user.userId) return of([]);

    return this.notificationService.watch(() =>
      this.http.get<BackendTransactionResponse[]>(`${this.apiUrl}/${user.userId}/transactions`).pipe(
        map(txs => {
           const sorted = txs.sort((a, b) => new Date(b.transactionTime).getTime() - new Date(a.transactionTime).getTime());
           return sorted.map(this.mapBackendToFrontend);
        }),
        catchError(err => {
          console.error('Failed to fetch all transactions:', err);
          return of([]);
        })
      )
    );
  }

  transferFunds(payload: TransferPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/transfer`, payload, { responseType: 'text' });
  }

  transferBetweenOwnAccounts(payload: InternalTransferPayload): Observable<any> {
    return this.http.put(`${this.apiUrl}/transfer-transaction`, payload, { responseType: 'text' });
  }

  depositFunds(payload: CashTransactionPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/deposit`, payload, { responseType: 'text' });
  }

  withdrawFunds(payload: CashTransactionPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/withdraw`, payload, { responseType: 'text' });
  }

  getAdminAuditLog() {
    return this.adminAuditLog;
  }

  getUniqueRecipients(): Observable<Array<{ name: string; accountNumber: string; avatar: string }>> {
    const user = this.authService.user();
    if (!user || !user.userId) return of([]);

    return this.getAllTransactions().pipe(
      map(txs => {
        const recipientsMap = new Map<string, { name: string; accountNumber: string; avatar: string }>();

        // We only care about debit transactions where we have recipient details
        txs.filter(tx => tx.type === 'debit' && tx.targetAccountNumber).forEach(tx => {
          if (!recipientsMap.has(tx.targetAccountNumber!)) {
            recipientsMap.set(tx.targetAccountNumber!, {
              name: tx.targetAccountName || 'Unknown Recipient',
              accountNumber: tx.targetAccountNumber!,
              avatar: ''
            });
          }
        });

        return Array.from(recipientsMap.values());
      })
    );
  }
}
