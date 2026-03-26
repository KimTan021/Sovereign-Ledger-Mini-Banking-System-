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
  status = input<'completed' | 'pending' | 'declined' | 'verified' | 'neutral'>('neutral');
  size = input<'xs' | 'sm' | 'md'>('sm');
  showDot = input<boolean>(true);

  badgeClasses = computed(() => {
    const base = 'flex items-center gap-1.5 px-3 py-1 rounded-full w-fit font-bold ';
    const sizes = {
      xs: 'text-[9px] px-2 py-0.5',
      sm: 'text-[10px] px-2.5 py-1',
      md: 'text-xs px-3 py-1.5'
    };

    const colors = {
      completed: 'text-tertiary-fixed bg-tertiary-container',
      pending: 'text-secondary-fixed bg-secondary-container',
      declined: 'text-error-fixed bg-error-container',
      verified: 'text-primary-fixed bg-primary-container',
      neutral: 'text-on-surface-variant bg-surface-container-highest'
    };

    return base + sizes[this.size()] + ' ' + colors[this.status()];
  });

  dotClasses = computed(() => {
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

    return base + sizes[this.size()] + ' ' + colors[this.status()];
  });
}
