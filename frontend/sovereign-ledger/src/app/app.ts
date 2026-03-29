import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: [],
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  private readonly syncRealtimeLifecycle = effect(() => {
    if (this.authService.isAuthenticated()) {
      this.notificationService.init();
      return;
    }
    this.notificationService.shutdown();
  });
}
