import { Directive, HostListener, inject, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appTrimInput]',
  standalone: true
})
export class TrimInputDirective {
  private readonly ngControl = inject(NgControl, { optional: true });
  private readonly elementRef = inject(ElementRef);

  @HostListener('blur')
  onBlur(): void {
    const input = this.elementRef.nativeElement as HTMLInputElement | HTMLTextAreaElement;
    if (!input || typeof input.value !== 'string') {
      return;
    }

    const value = input.value;
    const trimmed = value.trim();
    
    if (value !== trimmed) {
      // Update visual value
      input.value = trimmed;

      // Update Angular FormControl if present
      if (this.ngControl?.control) {
        this.ngControl.control.setValue(trimmed, {
          emitEvent: false, 
          emitModelToViewChange: false 
        });
      }
    }
  }
}
