import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Transaction } from '../../../core/services/transaction.service';
import { BadgeComponent } from '../badge/badge.component';

@Component({
  selector: 'app-transaction-item',
  imports: [CommonModule, CurrencyPipe, BadgeComponent],
  template: `
    <div class="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl shadow-sm hover:translate-x-1 transition-transform cursor-pointer group">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
             [class]="transaction().type === 'credit' ? 'bg-tertiary-container/20 group-hover:bg-tertiary-container/30' : 'bg-surface-container group-hover:bg-surface-container-high'">
          <span class="material-symbols-outlined"
                [class]="transaction().type === 'credit' ? 'text-on-tertiary-fixed-variant' : 'text-primary'">{{ transaction().icon }}</span>
        </div>
        <div>
          <p class="font-semibold text-on-surface">{{ transaction().description }}</p>
          <p class="text-xs text-on-surface-variant">{{ transaction().category }} &bull; {{ transaction().date }}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="font-bold font-headline"
           [class]="transaction().type === 'credit' ? 'text-on-tertiary-fixed-variant' : 'text-primary'">
          {{ transaction().amount > 0 ? '+' : '' }}{{ transaction().amount | currency:'PHP':'symbol':'1.2-2' }}
        </p>
        <app-badge [status]="transaction().status" size="xs">
          {{ transaction().status }}
        </app-badge>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionItemComponent {
  transaction = input.required<Transaction>();
}
