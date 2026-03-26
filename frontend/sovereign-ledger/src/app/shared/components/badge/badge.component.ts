import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getBadgeClasses()">
      <span *ngIf="showDot" [class]="getDotClasses()"></span>
      <span class="uppercase tracking-wider">
        <ng-content></ng-content>
      </span>
    </div>
  `,
  styles: [`
    :host { display: inline-block; vertical-align: middle; }
  `]
})
export class BadgeComponent {
  @Input() status: 'completed' | 'pending' | 'declined' | 'verified' | 'neutral' = 'neutral';
  @Input() size: 'xs' | 'sm' | 'md' = 'sm';
  @Input() showDot: boolean = true;

  getBadgeClasses(): string {
    const base = 'flex items-center gap-1.5 px-3 py-1 rounded-full w-fit font-bold ';
    const sizes = {
      xs: 'text-[9px] px-2 py-0.5',
      sm: 'text-[10px] px-2.5 py-1',
      md: 'text-xs px-3 py-1.5'
    };

    const colors = {
      completed: 'text-on-tertiary-fixed bg-tertiary-fixed',
      pending: 'text-on-secondary-fixed bg-secondary-fixed',
      declined: 'text-on-error-container bg-error-container',
      verified: 'text-on-primary-fixed bg-primary-fixed',
      neutral: 'text-on-surface-variant bg-surface-container-highest'
    };

    return base + sizes[this.size] + ' ' + colors[this.status];
  }

  getDotClasses(): string {
    const base = 'rounded-full ';
    const sizes = {
      xs: 'w-1 h-1',
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2'
    };

    const colors = {
      completed: 'bg-on-tertiary-fixed',
      pending: 'bg-on-secondary-fixed',
      declined: 'bg-on-error-container',
      verified: 'bg-on-primary-fixed',
      neutral: 'bg-outline'
    };

    return base + sizes[this.size] + ' ' + colors[this.status];
  }
}
