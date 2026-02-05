import { Component, EventEmitter, Output, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeStateService } from '../../../../core/services/badge-state.service';
import { DraggableElementComponent } from '../../../../shared/components/draggable-element/draggable-element.component';
import { BadgeElement } from '../../../../core/models/badge.model';

@Component({
    selector: 'app-preview-dialog',
    standalone: true,
    imports: [CommonModule, DraggableElementComponent],
    template: `
    <div class="overlay" (click)="close.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <header>
          <h2>Preview do Crachá</h2>
          <div class="controls">
            <label class="toggle">
              <input type="checkbox" [checked]="showTags" (change)="toggleTags($event)">
              <span class="slider"></span>
              <span class="label-text">Mostrar Tags Dinâmicas</span>
            </label>
            <button class="close-btn" (click)="close.emit()">✕</button>
          </div>
        </header>
        
        <div class="content">
          <!-- FRONT -->
          <div class="side-preview">
            <h3>Frente</h3>
            <div class="badge-container" 
                 [style.width.px]="dimensions().width" 
                 [style.height.px]="dimensions().height">
                 
               @for (el of getElements('front'); track el.id) {
                 <div class="element-wrapper"
                      [style.left.px]="el.x"
                      [style.top.px]="el.y"
                      [style.z-index]="el.zIndex"
                      style="position: absolute;">
                      
                    <app-draggable-element 
                      [element]="el" 
                      [isSelected]="false" 
                      [scale]="1">
                    </app-draggable-element>
                 </div>
               }
            </div>
          </div>

          <!-- BACK -->
          <div class="side-preview">
            <h3>Verso</h3>
            <div class="badge-container" 
                 [style.width.px]="dimensions().width" 
                 [style.height.px]="dimensions().height">
                 
               @for (el of getElements('back'); track el.id) {
                 <div class="element-wrapper"
                      [style.left.px]="el.x"
                      [style.top.px]="el.y"
                      [style.z-index]="el.zIndex"
                       style="position: absolute;">
                      
                    <app-draggable-element 
                      [element]="el" 
                      [isSelected]="false" 
                      [scale]="1">
                    </app-draggable-element>
                 </div>
               }
            </div>
          </div>
        </div>
        
        <div class="footer">
             <small>{{ getVisibleCount() }} elementos visíveis.</small>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.6);
      display: flex; justify-content: center; align-items: center;
      z-index: 9999;
      backdrop-filter: blur(2px);
    }
    .dialog {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      width: 90%;
      max-width: 1000px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #eee;
      display: flex; justify-content: space-between; align-items: center;
      background: #f9fafb;
    }
    h2 { margin: 0; font-size: 1.25rem; color: #1f2937; }
    .content {
      padding: 2rem;
      display: flex;
      gap: 2rem;
      justify-content: center;
      overflow-y: auto;
      background: #f3f4f6;
    }
    .side-preview {
      display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
    }
    .side-preview h3 { margin: 0; color: #4b5563; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; }
    
    .badge-container {
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      position: relative;
      overflow: hidden;
      /* Ensure clicks don't register */
      pointer-events: none; 
      border: 1px solid #e5e7eb;
    }

    .controls { display: flex; align-items: center; gap: 1rem; }
    .close-btn { 
      background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280; padding: 0.5rem;
    }
    .close-btn:hover { color: #000; }
    
    /* Toggle Switch */
    .toggle { display: flex; align-items: center; cursor: pointer; gap: 0.5rem; user-select: none; }
    .toggle input { display: none; }
    .slider {
      width: 40px; height: 20px; background: #e5e7eb; border-radius: 20px; position: relative; transition: 0.2s;
    }
    .slider:before {
      content: ''; position: absolute; width: 16px; height: 16px; border-radius: 50%; background: white;
      top: 2px; left: 2px; transition: 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
    input:checked + .slider { background: #4f46e5; }
    input:checked + .slider:before { transform: translateX(20px); }
    .label-text { font-size: 0.875rem; color: #374151; font-weight: 500; }

    .footer { padding: 1rem; border-top: 1px solid #eee; text-align: right; color: #6b7280; }
  `]
})
export class PreviewDialogComponent {
    @Output() close = new EventEmitter<void>();

    badgeService = inject(BadgeStateService);
    elements = this.badgeService.elements;
    dimensions = this.badgeService.badgeDimensions;

    showTags = true;

    toggleTags(event: Event) {
        this.showTags = (event.target as HTMLInputElement).checked;
    }

    getElements(side: 'front' | 'back') {
        return this.elements().filter(el => {
            // 1. Filter by side
            if (el.side !== side) return false;

            // 2. Filter by tag visibility
            if (!this.showTags && this.isDynamic(el.content)) return false;

            return true;
        });
    }

    getVisibleCount() {
        return this.getElements('front').length + this.getElements('back').length;
    }

    isDynamic(content: string): boolean {
        return content.trim().startsWith('{{') && content.trim().endsWith('}}');
    }
}
