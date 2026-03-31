import { Component, input, output, signal, inject, ElementRef, ViewChildren, QueryList, AfterViewInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TransactionService } from '../../../core/services/transaction.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-otp-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-on-surface/40 backdrop-blur-[20px] animate-in fade-in duration-300"
        (click)="onCancel()">
      </div>
      
      <!-- Modal Content -->
      <div class="relative bg-white w-full max-w-md rounded-3xl shadow-ambient overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <!-- Header -->
        <div class="p-8 text-center bg-surface-container-low border-b border-outline-variant/30">
          <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
            <span class="material-symbols-outlined text-3xl">shield_person</span>
          </div>
          <h3 class="text-2xl font-headline font-bold text-primary">{{ title() }}</h3>
          <p class="text-on-surface-variant text-sm mt-2 leading-relaxed">
            A 6-digit security code has been sent to<br>
            <span class="font-bold text-surface-tint">{{ userEmail() }}</span>
          </p>
        </div>
        
        <!-- Body -->
        <div class="p-8 space-y-8">
          <!-- OTP Input Group -->
          <div class="flex justify-center gap-2">
            @for (i of [0,1,2,3,4,5]; track i) {
              <input
                #otpInput
                type="text"
                maxlength="1"
                class="w-12 h-16 text-center text-2xl font-headline font-bold bg-surface-container-high rounded-xl border-2 border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all"
                (input)="onInput($event, i)"
                (keydown)="onKeyDown($event, i)"
                [disabled]="isLoading()" />
            }
          </div>

          @if (errorMessage()) {
            <div class="p-3 bg-error-container/30 rounded-xl flex items-center gap-2 text-error text-xs font-bold animate-in slide-in-from-top-1 duration-200">
              <span class="material-symbols-outlined text-sm">error</span>
              {{ errorMessage() }}
            </div>
          }

          @if (successMessage()) {
             <div class="p-3 bg-tertiary-container/30 rounded-xl flex items-center gap-2 text-on-tertiary-fixed-variant text-xs font-bold">
               <span class="material-symbols-outlined text-sm">check_circle</span>
               {{ successMessage() }}
             </div>
          }
          
          <!-- Resend Section -->
          <div class="text-center">
            <button 
              type="button"
              (click)="onResend()"
              [disabled]="resendCooldown() > 0 || isLoading()"
              class="text-xs font-black uppercase tracking-widest text-primary disabled:text-outline/50 hover:underline transition-all cursor-pointer">
              @if (resendCooldown() > 0) {
                Resend code in {{ resendCooldown() }}s
              } @else {
                Resend security code
              }
            </button>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="px-8 pb-8 flex gap-3">
          <button 
            type="button"
            (click)="onCancel()"
            [disabled]="isLoading()"
            class="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-outline hover:bg-surface-container-high rounded-2xl transition-all cursor-pointer">
            Cancel
          </button>
          <button 
            type="button"
            (click)="onVerify()"
            [disabled]="!isComplete() || isLoading()"
            class="flex-1 py-4 bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-ambient hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2">
            @if (isLoading()) {
              <span class="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>
              Verifying...
            } @else {
              <span>Verify & Complete</span>
              <span class="material-symbols-outlined text-sm">verified_user</span>
            }
          </button>
        </div>
      </div>
    </div>
  `
})
export class OtpModalComponent implements AfterViewInit, OnDestroy {
  private readonly transactionService = inject(TransactionService);
  private readonly authService = inject(AuthService);

  title = input<string>('Security Verification');
  userEmail = computed(() => this.authService.user()?.userEmail || 'registered email');
  verified = output<void>();
  cancelled = output<void>();

  @ViewChildren('otpInput') inputs!: QueryList<ElementRef<HTMLInputElement>>;

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  otpValue = signal<string[]>(new Array(6).fill(''));
  isComplete = computed(() => this.otpValue().every(v => v !== ''));
  resendCooldown = signal(0);
  private cooldownInterval?: any;

  ngAfterViewInit() {
    setTimeout(() => this.inputs.first.nativeElement.focus(), 0);
  }

  ngOnDestroy() {
    this.stopCooldown();
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
       input.value = '';
       return;
    }

    const currentValues = [...this.otpValue()];
    currentValues[index] = value;
    this.otpValue.set(currentValues);

    if (value && index < 5) {
      this.inputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.otpValue()[index] && index > 0) {
      this.inputs.toArray()[index - 1].nativeElement.focus();
    }
  }

  onResend() {
    this.errorMessage.set(null);
    this.isLoading.set(true);
    this.transactionService.resendTransactionOtp(this.userEmail()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('A new code has been sent!');
        this.startCooldown();
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to resend code.');
      }
    });
  }

  onVerify() {
    const code = this.otpValue().join('');
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.transactionService.verifyTransactionOtp(this.userEmail(), code).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.verified.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Verification failed. Please try again.');
        // Reset inputs on error
        this.otpValue.set(new Array(6).fill(''));
        this.inputs.forEach(i => i.nativeElement.value = '');
        this.inputs.first.nativeElement.focus();
      }
    });
  }

  onCancel() {
    if (this.isLoading()) return;
    this.transactionService.cancelTransactionOtp().subscribe();
    this.cancelled.emit();
  }

  private startCooldown() {
    this.resendCooldown.set(60);
    this.stopCooldown();
    this.cooldownInterval = setInterval(() => {
      this.resendCooldown.update(c => c > 0 ? c - 1 : 0);
      if (this.resendCooldown() === 0) this.stopCooldown();
    }, 1000);
  }

  private stopCooldown() {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
      this.cooldownInterval = undefined;
    }
  }
}
