import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getCardClasses()" [class.p-8]="padding" [class.p-0]="!padding" class="h-full w-full">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
  `]
})
export class CardComponent {
  @Input() variant: 'primary' | 'surface' | 'low' | 'lowest' | 'outline' = 'lowest';
  @Input() padding: boolean = true;
  @Input() customClass: string = '';

  getCardClasses(): string {
    const base = 'rounded-2xl transition-all duration-300 relative ';
    const variants = {
      primary: 'primary-gradient text-on-primary shadow-xl shadow-primary/10 overflow-hidden',
      surface: 'bg-surface-container text-on-surface shadow-sm border border-outline-variant/10',
      low: 'bg-surface-container-low text-on-surface shadow-sm border border-outline-variant/5',
      lowest: 'bg-surface-container-lowest text-on-surface shadow-sm border border-outline-variant/10',
      outline: 'bg-transparent border border-outline-variant/30 text-on-surface'
    };

    return base + variants[this.variant] + ' ' + this.customClass;
  }
}
