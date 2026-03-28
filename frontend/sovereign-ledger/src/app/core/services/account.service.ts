import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';
import { AuthService } from './auth.service';

export interface Account {
  id: string;
  holderName: string;
  initials: string;
  type: string;
  balance: number;
  availableBalance: number;
  unclearedFunds: number;
  status: 'verified' | 'flagged' | 'pending';
  lastFour: string;
}

export interface BackendAccountResponse {
  accountId: number;
  userId: number;
  accountNumber: string;
  accountType: string;
  accountBalance: number;
  accountStatus: string;
}

export interface Recipient {
  initials: string;
  name: string;
  colorClass: string;
  accountNumber?: string;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:8080/accounts';

  private readonly adminAccounts: Account[] = [
    {
      id: 'SL-9921-X', holderName: 'Alexander Magnus', initials: 'AM',
      type: 'Premium', balance: 1240000.00, availableBalance: 1240000.00,
      unclearedFunds: 0, status: 'verified', lastFour: '9921',
    },
    {
      id: 'SL-4410-B', holderName: 'Elena Jovic', initials: 'EJ',
      type: 'Premium', balance: 892450.22, availableBalance: 892450.22,
      unclearedFunds: 0, status: 'verified', lastFour: '4410',
    },
    {
      id: 'SL-1102-K', holderName: 'Sarah Kessler', initials: 'SK',
      type: 'Standard', balance: 412000.00, availableBalance: 412000.00,
      unclearedFunds: 0, status: 'flagged', lastFour: '1102',
    },
  ];



  private mapBackendToFrontend(beAcc: BackendAccountResponse, userName: string): Account {
    const acctStr = beAcc.accountNumber || '';
    const lastFour = acctStr.length >= 4 ? acctStr.slice(-4) : acctStr;

    return {
      id: beAcc.accountId.toString(),
      holderName: userName,
      initials: 'User',
      type: beAcc.accountType || 'Standard',
      balance: beAcc.accountBalance,
      availableBalance: beAcc.accountBalance,
      unclearedFunds: 0,
      status: 'verified',
      lastFour: lastFour
    };
  }

  getCustomerAccounts(): Observable<Account[]> {
    const user = this.authService.user();
    if (!user || !user.userId) return of([]);

    return this.http.get<BackendAccountResponse[]>(`${this.apiUrl}/${user.userId}/accounts`).pipe(
      map(accounts => {
        if (!accounts || accounts.length === 0) return [];
        return accounts.map(acc => this.mapBackendToFrontend(acc, user.name));
      }),
      catchError(err => {
        console.error('Failed to fetch customer accounts:', err);
        return of([]);
      })
    );
  }

  // Backward compatibility helper
  getCustomerAccount(): Observable<Account | null> {
    return this.getCustomerAccounts().pipe(
      map(accounts => accounts.length > 0 ? accounts[0] : null)
    );
  }

  getAllAccounts(): Account[] {
    return this.adminAccounts;
  }


}
