import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses()" [class.p-8]="padding()" [class.p-0]="!padding()" class="h-full w-full">
      @if (pattern()) {
        <div class="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-700" 
             [class]="patternClasses()"
             style="background-size: 100px 100px;"></div>
      }
      <div class="relative z-10 h-full">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .pattern-bubbles {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='white' fill-opacity='0.1'/%3E%3C/svg%3E");
    }
    .pattern-circuit {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M10 10h80v80h-80z' fill='none' stroke='white' stroke-opacity='0.1' stroke-width='1'/%3E%3Ccircle cx='10' cy='10' r='2' fill='white' fill-opacity='0.2'/%3E%3C/svg%3E");
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  variant = input<'primary' | 'surface' | 'low' | 'lowest' | 'outline'>('lowest');
  padding = input<boolean>(true);
  customClass = input<string>('');
  pattern = input<'bubbles' | 'circuit' | null>(null);

  patternClasses = computed(() => {
    return 'pattern-' + this.pattern();
  });

  cardClasses = computed(() => {
    const base = 'rounded-2xl transition-all duration-300 relative overflow-hidden ';
    // ...
    const variants = {
      primary: 'primary-gradient text-on-primary shadow-ambient overflow-hidden',
      surface: 'bg-surface-container text-on-surface shadow-ambient',
      low: 'bg-surface-container-low text-on-surface shadow-ambient',
      lowest: 'bg-surface-container-lowest text-on-surface shadow-ambient',
      outline: 'bg-transparent border border-outline-variant/15 text-on-surface'
    };

    return base + variants[this.variant()] + ' ' + this.customClass();
  });
}
