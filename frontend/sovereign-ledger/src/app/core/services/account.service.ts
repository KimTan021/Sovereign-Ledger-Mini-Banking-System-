import { Injectable } from '@angular/core';

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

export interface Recipient {
  initials: string;
  name: string;
  colorClass: string;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly customerAccount: Account = {
    id: 'SL-8829410',
    holderName: 'Adrian Sovereign',
    initials: 'AS',
    type: 'Corporate Prime',
    balance: 142850.42,
    availableBalance: 138200.00,
    unclearedFunds: 4650.42,
    status: 'verified',
    lastFour: '9012',
  };

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

  private readonly recipients: Recipient[] = [
    { initials: 'MK', name: 'Marcus K.', colorClass: 'bg-secondary-container' },
    { initials: 'AL', name: 'Alpha Labs', colorClass: 'bg-tertiary-container/10' },
    { initials: 'SR', name: 'Sarah Reed', colorClass: 'bg-primary-fixed' },
  ];

  getCustomerAccount(): Account {
    return this.customerAccount;
  }

  getAllAccounts(): Account[] {
    return this.adminAccounts;
  }

  getRecipients(): Recipient[] {
    return this.recipients;
  }
}
