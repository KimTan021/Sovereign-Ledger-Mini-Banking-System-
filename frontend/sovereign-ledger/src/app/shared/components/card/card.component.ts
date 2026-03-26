import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses()" [class.p-8]="padding()" [class.p-0]="!padding()" class="h-full w-full">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  variant = input<'primary' | 'surface' | 'low' | 'lowest' | 'outline'>('lowest');
  padding = input<boolean>(true);
  customClass = input<string>('');

  cardClasses = computed(() => {
    const base = 'rounded-2xl transition-all duration-300 relative ';
    const variants = {
      primary: 'primary-gradient text-on-primary shadow-xl shadow-primary/10 overflow-hidden',
      surface: 'bg-surface-container text-on-surface shadow-sm',
      low: 'bg-surface-container-low text-on-surface shadow-sm',
      lowest: 'bg-surface-container-lowest text-on-surface shadow-sm',
      outline: 'bg-transparent border border-outline-variant/20 text-on-surface'
    };

    return base + variants[this.variant()] + ' ' + this.customClass();
  });
}
