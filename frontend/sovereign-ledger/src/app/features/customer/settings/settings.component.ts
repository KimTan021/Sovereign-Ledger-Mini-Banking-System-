import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { CustomerService } from '../../../core/services/customer.service';
import { AuthService } from '../../../core/services/auth.service';
import { TrimInputDirective } from '../../../shared/directives/trim-input.directive';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, FooterComponent, CardComponent, TrimInputDirective],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);
  private readonly authService = inject(AuthService);

  profile = toSignal(this.customerService.getProfile(), { initialValue: null });
  profileMessage = signal<string | null>(null);
  passwordMessage = signal<string | null>(null);
  profileError = signal<string | null>(null);
  passwordError = signal<string | null>(null);
  isSavingProfile = signal(false);
  isSavingPassword = signal(false);
  profileSubmitted = signal(false);
  passwordSubmitted = signal(false);

  profileForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(45), Validators.pattern(/^[A-Za-z][A-Za-z\s'-]*$/)]],
    middleName: ['', [Validators.maxLength(45), Validators.pattern(/^$|^[A-Za-z][A-Za-z\s'-]*$/)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(45), Validators.pattern(/^[A-Za-z][A-Za-z\s'-]*$/)]],
    userEmail: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9+ ]{10,15}$')]],
  });

  passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  private readonly syncProfile = effect(() => {
    const profile = this.profile();
    if (!profile) return;
    this.profileForm.patchValue({
      firstName: profile.firstName || '',
      middleName: profile.middleName || '',
      lastName: profile.lastName || '',
      userEmail: profile.userEmail || '',
      phone: profile.phone || '',
    });
  });

  saveProfile(): void {
    this.profileSubmitted.set(true);
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid || this.isSavingProfile()) return;
    this.isSavingProfile.set(true);
    this.profileError.set(null);
    this.profileMessage.set(null);

    this.customerService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: (profile) => {
        this.isSavingProfile.set(false);
        this.profileMessage.set('Profile updated successfully.');
        this.authService.patchUser({
          name: `${profile.firstName} ${profile.lastName}`.trim(),
        });
      },
      error: (err) => {
        this.isSavingProfile.set(false);
        this.profileError.set(typeof err.error === 'string' ? err.error : (err.error?.message || 'Profile update failed.'));
      }
    });
  }

  changePassword(): void {
    this.passwordSubmitted.set(true);
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid || this.isSavingPassword()) return;
    this.isSavingPassword.set(true);
    this.passwordError.set(null);
    this.passwordMessage.set(null);

    this.customerService.changePassword(this.passwordForm.getRawValue()).subscribe({
      next: (message) => {
        this.isSavingPassword.set(false);
        this.passwordMessage.set(message);
        this.passwordForm.reset();
        this.passwordSubmitted.set(false);
      },
      error: (err) => {
        this.isSavingPassword.set(false);
        this.passwordError.set(typeof err.error === 'string' ? err.error : (err.error?.message || 'Password update failed.'));
      }
    });
  }

  hasProfileError(controlName: string): boolean {
    const control = this.profileForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.profileSubmitted());
  }

  getProfileError(controlName: string): string | null {
    const control = this.profileForm.get(controlName);
    if (!control || !this.hasProfileError(controlName)) return null;
    if (control.hasError('required')) return `${controlName === 'phone' ? 'Phone number' : controlName === 'userEmail' ? 'Email address' : controlName === 'firstName' ? 'First name' : 'Last name'} is required.`;
    if (control.hasError('email')) return 'Enter a valid email address.';
    if (control.hasError('pattern')) return controlName === 'phone'
      ? 'Phone number must contain 10 to 15 digits and may include a leading plus sign.'
      : 'Only letters, spaces, apostrophes, and hyphens are allowed.';
    if (control.hasError('minlength')) return 'This entry is too short.';
    if (control.hasError('maxlength')) return 'This entry is too long.';
    return null;
  }

  hasPasswordError(controlName: string): boolean {
    const control = this.passwordForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.passwordSubmitted());
  }

  getPasswordError(controlName: string): string | null {
    const control = this.passwordForm.get(controlName);
    if (!control || !this.hasPasswordError(controlName)) return null;
    if (control.hasError('required')) return controlName === 'currentPassword' ? 'Current password is required.' : 'New password is required.';
    if (control.hasError('minlength')) return 'Password must be at least 8 characters.';
    return null;
  }
}
