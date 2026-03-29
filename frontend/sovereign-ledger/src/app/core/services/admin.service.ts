import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface PendingUser {
  userId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  userEmail: string;
  requestAccountType: string;
  phone: string;
  initialDeposit: number;
  requestTime: string;
  requestStatus: string;
  reviewedAt?: string | null;
}

export interface UserApprovalResponse {
  userId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  userEmail: string;
  role: string;
  accountType: string;
  accountStatus: string;
  accountBalance: string;
}

export interface AdminStats {
  totalLiquidity: number;
  dailyVolume: number;
  activeEntities: number;
}

export interface TopAccount {
  userId: number;
  firstName: string;
  lastName: string;
  accountBalance: number;
}

export interface CategoryMetric {
  category: string;
  value: number;
}

export interface TopTransactor {
  id: number;
  label: string;
  totalAmount: number;
  transactionCount: number;
}

export interface AnalyticsDashboard {
  dailyVolume: CategoryMetric[];
  transactionDistribution: CategoryMetric[];
  volumeByAmount: CategoryMetric[];
  accountGrowth: CategoryMetric[];
  flaggedTrend: CategoryMetric[];
  netFlow: CategoryMetric[];
  approvalAging: CategoryMetric[];
  accountStatusBreakdown: CategoryMetric[];
  userStatusBreakdown: CategoryMetric[];
  adjustmentAnalytics: CategoryMetric[];
  complianceReviewAnalytics: CategoryMetric[];
  topUserTransactors: TopTransactor[];
  topAccountTransactors: TopTransactor[];
}

export interface AuditLogEntry {
  transactionId: number;
  accountId: number;
  userId: number;
  userName: string;
  accountNumber: string;
  title: string;
  detail: string;
  amount: number;
  type: string;
  status: string;
  reviewNote?: string | null;
  error: boolean;
  timestamp: string;
}

export interface SystemUser {
  userId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  userEmail: string;
  phone?: string;
  role: string;
  userStatus: string;
  accountNumber?: string;
  accountCount: number;
}

export interface AdminAccount {
  accountId: number;
  accountNumber: string;
  accountType: string;
  accountBalance: number;
  accountStatus: string;
}

export interface AdminUserDetail {
  userId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  userEmail: string;
  phone?: string;
  role: string;
  userStatus: string;
  totalBalance: number;
  accounts: AdminAccount[];
}

export interface UserProfileUpdatePayload {
  firstName: string;
  middleName: string;
  lastName: string;
  userEmail: string;
  phone: string;
}

export interface PasswordResetResponse {
  userId: number;
  temporaryPassword: string;
}

export interface TransactionSearchFilters {
  search?: string;
  userId?: number | null;
  accountId?: number | null;
  minAmount?: number | null;
  maxAmount?: number | null;
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/admin';

  getPendingUsers(page: number = 0, size: number = 10): Observable<PaginatedResponse<PendingUser>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PaginatedResponse<PendingUser>>(`${this.apiUrl}/pending-users`, { params });
  }

  getUsers(page: number = 0, size: number = 10): Observable<PaginatedResponse<SystemUser>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PaginatedResponse<SystemUser>>(`${this.apiUrl}/users`, { params });
  }

  getUserDetail(userId: number): Observable<AdminUserDetail> {
    return this.http.get<AdminUserDetail>(`${this.apiUrl}/users/${userId}`);
  }

  updateUserProfile(userId: number, payload: UserProfileUpdatePayload): Observable<SystemUser> {
    return this.http.put<SystemUser>(`${this.apiUrl}/users/${userId}/profile`, payload);
  }

  updateUserStatus(userId: number, status: string): Observable<SystemUser> {
    return this.http.put<SystemUser>(`${this.apiUrl}/users/${userId}/status`, { status });
  }

  updateUserRole(userId: number, role: string): Observable<SystemUser> {
    return this.http.put<SystemUser>(`${this.apiUrl}/users/${userId}/role`, { role });
  }

  resetUserPassword(userId: number, newPassword?: string): Observable<PasswordResetResponse> {
    return this.http.put<PasswordResetResponse>(`${this.apiUrl}/users/${userId}/reset-password`, { newPassword: newPassword || '' });
  }

  updateAccountStatus(accountId: number, status: string): Observable<AdminAccount> {
    return this.http.put<AdminAccount>(`${this.apiUrl}/accounts/${accountId}/status`, { status });
  }

  postAccountAdjustment(accountId: number, amount: number, adjustmentType: 'credit' | 'debit', description: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/accounts/${accountId}/adjustment`, {
      amount,
      adjustmentType,
      description
    });
  }

  searchTransactions(filters: TransactionSearchFilters, page: number = 0, size: number = 10): Observable<PaginatedResponse<AuditLogEntry>> {
    let params = new HttpParams().set('page', page).set('size', size);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value);
      }
    });

    return this.http.get<PaginatedResponse<AuditLogEntry>>(`${this.apiUrl}/transactions`, { params });
  }

  reviewTransaction(transactionId: number, status: string, note: string): Observable<AuditLogEntry> {
    return this.http.put<AuditLogEntry>(`${this.apiUrl}/transactions/${transactionId}/review`, { status, note });
  }

  approveUser(id: number): Observable<UserApprovalResponse> {
    return this.http.put<UserApprovalResponse>(`${this.apiUrl}/pending-users/${id}/approve`, {});
  }

  rejectUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pending-users/${id}/reject`);
  }

  getSystemStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats`);
  }

  getHighValueAccounts(): Observable<TopAccount[]> {
    return this.http.get<TopAccount[]>(`${this.apiUrl}/high-value`);
  }

  getAuditLogs(): Observable<AuditLogEntry[]> {
    return this.http.get<AuditLogEntry[]>(`${this.apiUrl}/audit-log`);
  }

  getFullAuditLogs(page: number = 0, size: number = 10): Observable<PaginatedResponse<AuditLogEntry>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PaginatedResponse<AuditLogEntry>>(`${this.apiUrl}/audit-log/all`, { params });
  }

  getDailyVolume(): Observable<CategoryMetric[]> {
    return this.http.get<CategoryMetric[]>(`${this.apiUrl}/analytics/volume`);
  }

  getTransactionDistribution(): Observable<CategoryMetric[]> {
    return this.http.get<CategoryMetric[]>(`${this.apiUrl}/analytics/distribution`);
  }

  getAnalyticsDashboard(days: number): Observable<AnalyticsDashboard> {
    const params = new HttpParams().set('days', days);
    return this.http.get<AnalyticsDashboard>(`${this.apiUrl}/analytics/dashboard`, { params });
  }

  exportAuditCSV(entries: AuditLogEntry[], filename: string): void {
    const headers = ['Transaction ID', 'User', 'User ID', 'Account', 'Account ID', 'Title', 'Detail', 'Type', 'Status', 'Amount', 'Review Note', 'Timestamp'];
    const rows = entries.map(entry => [
      entry.transactionId,
      entry.userName,
      entry.userId,
      entry.accountNumber,
      entry.accountId,
      entry.title,
      entry.detail,
      entry.type,
      entry.status,
      entry.amount,
      entry.reviewNote || '',
      entry.timestamp
    ]);

    this.exportRowsAsCsv(headers, rows, filename);
  }

  exportUsersCSV(users: SystemUser[], filename: string): void {
    const headers = ['User ID', 'First Name', 'Middle Name', 'Last Name', 'Email', 'Phone', 'Role', 'Status', 'Primary Account', 'Account Count'];
    const rows = users.map(user => [
      user.userId,
      user.firstName,
      user.middleName || '',
      user.lastName,
      user.userEmail,
      user.phone || '',
      user.role,
      user.userStatus,
      user.accountNumber || '',
      user.accountCount
    ]);

    this.exportRowsAsCsv(headers, rows, filename);
  }

  exportPendingUsersCSV(users: PendingUser[], filename: string): void {
    const headers = ['Request ID', 'First Name', 'Middle Name', 'Last Name', 'Email', 'Phone', 'Requested Account', 'Initial Deposit', 'Request Time'];
    const rows = users.map(user => [
      user.userId,
      user.firstName,
      user.middleName || '',
      user.lastName,
      user.userEmail,
      user.phone || '',
      user.requestAccountType,
      user.initialDeposit,
      user.requestTime
    ]);

    this.exportRowsAsCsv(headers, rows, filename);
  }

  private exportRowsAsCsv(headers: string[], rows: Array<Array<string | number>>, filename: string): void {
    const csvContent = [headers, ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
