import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="mt-20 border-t border-outline-variant/10 py-12 px-6">
      <div class="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div class="flex flex-col items-center md:items-start">
          <span class="text-lg font-black text-primary font-headline">Sovereign Ledger</span>
          <p class="text-on-surface-variant text-sm mt-1">Institutional Grade Financial Sovereignty</p>
        </div>
        <div class="flex gap-8 text-sm font-semibold text-secondary">
          <a class="hover:text-primary transition-colors cursor-pointer">Privacy</a>
          <a class="hover:text-primary transition-colors cursor-pointer">Security</a>
          <a class="hover:text-primary transition-colors cursor-pointer">Support</a>
          <a class="hover:text-primary transition-colors cursor-pointer">Legal</a>
        </div>
        <p class="text-on-surface-variant text-xs font-medium">&copy; 2024 Sovereign Ledger Corp. All rights reserved.</p>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
