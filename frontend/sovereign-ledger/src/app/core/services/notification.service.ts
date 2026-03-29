import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, switchMap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

export interface NotificationItem {
  notificationId: number;
  userId: number;
  accountId?: number | null;
  transactionId?: number | null;
  notificationType: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DataChangeEvent {
  domains?: string[];
  timestamp?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:8080/notifications';

  private stream: EventSource | null = null;
  private initialized = false;
  dataVersion = signal(0);
  private readonly dataVersion$ = toObservable(this.dataVersion);

  notifications = signal<NotificationItem[]>([]);
  toasts = signal<NotificationItem[]>([]);
  unreadCount = computed(() => this.notifications().filter(item => !item.isRead).length);

  init(): void {
    if (this.initialized || !this.authService.isAuthenticated()) {
      return;
    }
    this.initialized = true;
    if (this.authService.userRole() === 'customer') {
      this.loadNotifications();
    }
    this.openStream();
  }

  watch<T>(loader: () => Observable<T>): Observable<T> {
    return this.dataVersion$.pipe(
      switchMap(() => loader())
    );
  }

  loadNotifications(): void {
    this.http.get<NotificationItem[]>(this.apiUrl).subscribe({
      next: items => this.notifications.set(items),
      error: () => this.notifications.set([])
    });
  }

  markAsRead(notificationId: number): void {
    this.http.put<NotificationItem>(`${this.apiUrl}/${notificationId}/read`, {}).subscribe({
      next: updated => {
        this.notifications.update(items => items.map(item =>
          item.notificationId === updated.notificationId ? updated : item
        ));
      }
    });
  }

  dismissToast(notificationId: number): void {
    this.toasts.update(items => items.filter(item => item.notificationId !== notificationId));
  }

  shutdown(): void {
    this.stream?.close();
    this.stream = null;
    this.initialized = false;
    this.notifications.set([]);
    this.toasts.set([]);
    this.dataVersion.set(0);
  }

  private openStream(): void {
    const token = this.authService.getToken();
    if (!token) {
      return;
    }

    this.stream?.close();
    this.stream = new EventSource(`${this.apiUrl}/stream?token=${encodeURIComponent(token)}`);
    this.stream.addEventListener('notification', event => {
      const notification = JSON.parse((event as MessageEvent).data) as NotificationItem;
      if (notification.notificationType === 'user-suspended') {
        this.authService.forceLogout(notification.message || 'Your account has been suspended.');
        return;
      }
      this.notifications.update(items => {
        const deduped = items.filter(item => item.notificationId !== notification.notificationId);
        return [notification, ...deduped];
      });
      this.toasts.update(items => [notification, ...items].slice(0, 3));
      window.setTimeout(() => this.dismissToast(notification.notificationId), 6000);
    });
    this.stream.addEventListener('data-change', event => {
      const payload = JSON.parse((event as MessageEvent).data) as DataChangeEvent;
      if (this.authService.userRole() === 'customer' && payload.domains?.includes('notifications')) {
        this.loadNotifications();
      }
      this.dataVersion.update(value => value + 1);
    });
    this.stream.onerror = () => {
      this.stream?.close();
      this.stream = null;
      this.initialized = false;
      window.setTimeout(() => this.init(), 4000);
    };
  }
}
