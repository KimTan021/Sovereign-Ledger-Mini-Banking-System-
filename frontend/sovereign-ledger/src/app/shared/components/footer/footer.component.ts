import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent],
  template: `
    <footer class="mt-32 py-16 px-6 bg-surface-container-low/30">
      <div class="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div class="flex flex-col items-center md:items-start">
          <span class="text-lg font-black text-primary font-headline">Sovereign Ledger</span>
          <p class="text-on-surface-variant text-sm mt-1">Institutional Grade Financial Sovereignty</p>
        </div>
        <div class="flex gap-8 text-sm font-semibold text-secondary">
          <a (click)="showPolicy('Privacy Policy')" class="hover:text-primary transition-colors cursor-pointer">Privacy</a>
          <a (click)="showPolicy('Security Standards')" class="hover:text-primary transition-colors cursor-pointer">Security</a>
          <a (click)="showPolicy('Customer Support')" class="hover:text-primary transition-colors cursor-pointer">Support</a>
          <a (click)="showPolicy('Legal & Regulatory')" class="hover:text-primary transition-colors cursor-pointer">Legal</a>
        </div>
        <p class="text-on-surface-variant text-xs font-medium">&copy; 2024 Sovereign Ledger Corp. All rights reserved.</p>
      </div>
    </footer>

    @if (activePolicy()) {
      <app-modal [title]="activePolicy()!" (close)="activePolicy.set(null)">
        <div class="prose prose-sm prose-slate">
          <p class="font-bold text-primary mb-4">Effective Date: March 2024</p>
          <p class="text-on-surface-variant leading-relaxed">
            At Sovereign Ledger, we prioritize the integrity and confidentiality of your financial data. 
            This document outlines our commitment to excellence in {{ activePolicy()?.toLowerCase() }}.
          </p>
          <ul class="mt-4 space-y-2 text-xs text-on-surface-variant list-disc pl-5">
            <li>End-to-end encryption for all data at rest and in transit.</li>
            <li>Regulatory compliance with global financial standards.</li>
            <li>Real-time fraud detection and automated ledger synchronization.</li>
          </ul>
          <p class="mt-6 text-xs text-outline italic">For detailed inquiries, please contact our institutional relations department.</p>
        </div>
      </app-modal>
    }
  `,
})
export class FooterComponent {
  activePolicy = signal<string | null>(null);

  showPolicy(name: string): void {
    this.activePolicy.set(name);
  }
}
