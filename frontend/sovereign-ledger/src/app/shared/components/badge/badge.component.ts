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
    const base = 'flex items-center gap-1.5 px-3 py-1 rounded-full w-fit font-bold ';
    const sizes = {
      xs: 'text-[9px] px-2 py-0.5',
      sm: 'text-[10px] px-2.5 py-1',
      md: 'text-xs px-3 py-1.5'
    };

    const colors: Record<string, string> = {
      completed: 'text-tertiary-fixed bg-tertiary-container',
      reviewed: 'text-tertiary-fixed bg-tertiary-container',
      active: 'text-tertiary-fixed bg-tertiary-container',
      approved: 'text-tertiary-fixed bg-tertiary-container',
      pending: 'text-on-secondary-fixed bg-secondary-container',
      suspended: 'text-on-secondary-fixed bg-secondary-container',
      frozen: 'text-on-secondary-fixed bg-secondary-container',
      declined: 'text-error-fixed bg-error-container',
      rejected: 'text-error-fixed bg-error-container',
      escalated: 'text-error-fixed bg-error-container',
      closed: 'text-error-fixed bg-error-container',
      verified: 'text-primary-fixed bg-primary-container',
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
      completed: 'bg-on-tertiary-fixed',
      reviewed: 'bg-on-tertiary-fixed',
      active: 'bg-on-tertiary-fixed',
      approved: 'bg-on-tertiary-fixed',
      pending: 'bg-on-secondary-fixed',
      suspended: 'bg-on-secondary-fixed',
      frozen: 'bg-on-secondary-fixed',
      declined: 'bg-on-error-container',
      rejected: 'bg-on-error-container',
      escalated: 'bg-on-error-container',
      closed: 'bg-on-error-container',
      verified: 'bg-on-primary-fixed',
      neutral: 'bg-outline'
    };
    const key = (this.status() || 'neutral').toLowerCase();
    return base + sizes[this.size()] + ' ' + (colors[key] || colors['neutral']);
  });
}
