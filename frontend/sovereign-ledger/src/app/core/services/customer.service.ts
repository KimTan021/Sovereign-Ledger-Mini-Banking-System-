import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { NotificationService } from './notification.service';

export interface CustomerProfile {
  userId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  userEmail: string;
  phone: string;
  userStatus: string;
}

export interface CustomerProfileUpdatePayload {
  firstName: string;
  middleName: string;
  lastName: string;
  userEmail: string;
  phone: string;
}

export interface CustomerPasswordChangePayload {
  currentPassword: string;
  newPassword: string;
}

export interface PendingAccountRequest {
  userId: number;
  requestAccountType: string;
  initialDeposit: number;
  requestTime: string;
  requestStatus: string;
  reviewedAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  private readonly profileApiUrl = 'http://localhost:8080/customer/profile';
  private readonly pendingApiUrl = 'http://localhost:8080/pending-user/my-requests';

  getProfile(): Observable<CustomerProfile> {
    return this.notificationService.watch(() => this.http.get<CustomerProfile>(this.profileApiUrl));
  }

  updateProfile(payload: CustomerProfileUpdatePayload): Observable<CustomerProfile> {
    return this.http.put<CustomerProfile>(this.profileApiUrl, payload);
  }

  changePassword(payload: CustomerPasswordChangePayload): Observable<string> {
    return this.http.put(this.profileApiUrl + '/password', payload, { responseType: 'text' });
  }

  getPendingRequests(): Observable<PendingAccountRequest[]> {
    return this.notificationService.watch(() =>
      this.http.get<PendingAccountRequest[]>(this.pendingApiUrl).pipe(
        catchError(() => of([]))
      )
    );
  }
}
