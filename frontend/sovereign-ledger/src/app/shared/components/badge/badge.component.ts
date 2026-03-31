import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  imports: [CommonModule],
  template: `
    <div [class]="badgeClasses()">
      @if (showDot()) {
        <span [class]="dotClasses()"></span>
      }
      <span class="uppercase tracking-wider">
        <ng-content></ng-content>
      </span>
    </div>
  `,
  styles: [`
    :host { display: inline-block; vertical-align: middle; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  status = input<string>('neutral');
  size = input<'xs' | 'sm' | 'md'>('sm');
  showDot = input<boolean>(true);

  badgeClasses = computed(() => {
    const base = 'flex items-center gap-1.5 rounded-full w-fit font-black tracking-[0.03em] ';
    const sizes = {
      xs: 'text-[9px] px-2 py-0.5',
      sm: 'text-[10px] px-3 py-1',
      md: 'text-xs px-3.5 py-1.5'
    };

    const colors: Record<string, string> = {
      completed: 'text-on-tertiary-fixed bg-tertiary-fixed',
      reviewed: 'text-on-tertiary-fixed bg-tertiary-fixed',
      active: 'text-on-tertiary-fixed bg-tertiary-fixed',
      approved: 'text-on-tertiary-fixed bg-tertiary-fixed',
      pending: 'text-on-secondary-fixed bg-secondary-fixed',
      suspended: 'text-on-secondary-fixed bg-secondary-fixed',
      frozen: 'text-on-secondary-fixed bg-secondary-fixed',
      declined: 'text-on-error-container bg-error-container',
      rejected: 'text-on-error-container bg-error-container',
      escalated: 'text-on-error-container bg-error-container',
      closed: 'text-on-error-container bg-error-container',
      verified: 'text-on-primary-fixed bg-primary-fixed',
      neutral: 'text-on-surface-variant bg-surface-container-highest'
    };
    const key = (this.status() || 'neutral').toLowerCase();
    return base + sizes[this.size()] + ' ' + (colors[key] || colors['neutral']);
  });

  dotClasses = computed(() => {
    const base = 'rounded-full ';
    const sizes = {
      xs: 'w-1 h-1',
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2'
    };

    const colors: Record<string, string> = {
      completed: 'bg-tertiary',
      reviewed: 'bg-tertiary',
      active: 'bg-tertiary',
      approved: 'bg-tertiary',
      pending: 'bg-secondary',
      suspended: 'bg-secondary',
      frozen: 'bg-secondary',
      declined: 'bg-error',
      rejected: 'bg-error',
      escalated: 'bg-error',
      closed: 'bg-error',
      verified: 'bg-primary',
      neutral: 'bg-outline'
    };
    const key = (this.status() || 'neutral').toLowerCase();
    return base + sizes[this.size()] + ' ' + (colors[key] || colors['neutral']);
  });
}
