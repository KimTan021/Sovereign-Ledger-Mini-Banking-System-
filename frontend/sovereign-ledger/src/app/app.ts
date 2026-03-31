import { Component, effect, inject, untracked } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { CustomerService } from './core/services/customer.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: [],
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly customerService = inject(CustomerService);

  private readonly syncRealtimeLifecycle = effect(() => {
    if (this.authService.isAuthenticated()) {
      this.notificationService.init();
      return;
    }
    this.notificationService.shutdown();
  });

  private readonly syncProfileIdentity = effect(() => {
    const isCustomer = this.authService.userRole() === 'customer';
    if (isCustomer && this.authService.isAuthenticated()) {
      untracked(() => {
        this.customerService.getProfile().subscribe(profile => {
          const currentName = this.authService.userName();
          const newName = `${profile.firstName} ${profile.lastName}`;
          if (currentName !== newName) {
            this.authService.patchUser({ name: newName });
          }
        });
      });
    }
  }, { allowSignalWrites: true });
}
