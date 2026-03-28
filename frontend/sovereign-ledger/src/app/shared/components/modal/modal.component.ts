import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-300"
        (click)="close.emit()">
      </div>
      
      <!-- Modal Content -->
      <div class="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <!-- Header -->
        <div class="p-6 flex items-center justify-between bg-surface-container-low">
          <h3 class="text-xl font-headline font-bold text-primary">{{ title() }}</h3>
          <button 
            (click)="close.emit()"
            class="p-2 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <!-- Body -->
        <div class="p-8 max-h-[70vh] overflow-y-auto">
          <ng-content></ng-content>
        </div>
        
        <!-- Footer (Optional) -->
        <div class="p-6 flex justify-end bg-surface-container-low">
          <button 
            (click)="close.emit()"
            class="px-6 py-2 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-container transition-all cursor-pointer">
            Done
          </button>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  title = input<string>('Information');
  close = output<void>();
}
