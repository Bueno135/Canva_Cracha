import { Component, inject, signal, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeStateService } from '../../../../core/services/badge-state.service';
import { DraggableElementComponent } from '../../../../shared/components/draggable-element/draggable-element.component';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule, DraggableElementComponent],
  template: `
    <div class="canvas-staging-area" #stagingArea>
      <div class="zoom-controls">
        <button (click)="zoomOut()">-</button>
        <span class="zoom-level">{{ Math.round(scale() * 100) }}%</span>
        <button (click)="zoomIn()">+</button>
      </div>

      <!-- Resizable Container (holds size & zoom) -->
      <div class="resizable-container"
           [style.width.px]="dimensions().width" 
           [style.height.px]="dimensions().height"
           [style.zoom]="scale()"
           style="transform-origin: top left; transition: zoom 0.2s; position: relative;">

           <!-- Shadow & Clipping Container -->
           <div class="canvas-shadow">
               <div class="canvas" 
                    #canvasEl
                    [class.back-side]="activeSide() === 'back'"
                    (click)="clearSelection($event)">
                    
                 @if (activeSide() === 'back') {
                    <div class="watermark">BACK</div>
                 }
       
                 @for (el of elements(); track el.id) {
                   <div 
                     class="element-wrapper"
                     [class.selected]="isSelected(el.id)"
                     [style.left.px]="el.x"
                     [style.top.px]="el.y"
                     [style.z-index]="el.zIndex"
                     [attr.data-width]="el.width"
                     [attr.data-height]="el.height"
                     (dblclick)="startEditing(el.id)"
                     (contextmenu)="onRightClick($event, el)">
                     
                     <app-draggable-element 
                       [element]="el" 
                       [isSelected]="isSelected(el.id)"
                       [isEditing]="editingId() === el.id"
                       [scale]="scale()"
                       (editComplete)="stopEditing()">
                     </app-draggable-element>
                     
                   </div>
                 }
               </div>
           </div>

          <!-- Canvas Resize Handles (Outside Shadow/Overflow) -->
          <div class="canvas-resize-handle nw" (mousedown)="onCanvasResizeStart($event, 'nw')"></div>
          <div class="canvas-resize-handle n" (mousedown)="onCanvasResizeStart($event, 'n')"></div>
          <div class="canvas-resize-handle ne" (mousedown)="onCanvasResizeStart($event, 'ne')"></div>
          <div class="canvas-resize-handle e" (mousedown)="onCanvasResizeStart($event, 'e')"></div>
          <div class="canvas-resize-handle se" (mousedown)="onCanvasResizeStart($event, 'se')"></div>
          <div class="canvas-resize-handle s" (mousedown)="onCanvasResizeStart($event, 's')"></div>
          <div class="canvas-resize-handle sw" (mousedown)="onCanvasResizeStart($event, 'sw')"></div>
          <div class="canvas-resize-handle w" (mousedown)="onCanvasResizeStart($event, 'w')"></div>
      </div>
      
      <!-- Custom Context Menu -->
      @if (contextMenu().visible) {
        <div class="context-menu" 
             [style.left.px]="contextMenu().x" 
             [style.top.px]="contextMenu().y"
             (click)="$event.stopPropagation()">
             
           <div class="menu-header">Propriedades</div>
           
           @if (selectedElement(); as el) {
               <div class="menu-item">
                   <label>Conteúdo:</label>
                   @if (el.type === 'image' || el.type === 'qr') {
                       <input [value]="el.content" (input)="updateContent($event, el.id)" class="menu-input">
                   } @else {
                       <select [value]="el.content" (change)="updateContent($event, el.id)" class="menu-input">
                           <option [value]="el.content">{{ el.content }} (Atual)</option>
                           <optgroup label="Dados do Funcionário">
                               @for (field of employeeFields; track field.value) {
                                   <option [value]="field.value">{{ field.label }}</option>
                               }
                           </optgroup>
                           <optgroup label="Outros">
                               <option value="Novo Texto">Texto Personalizado...</option>
                           </optgroup>
                       </select>
                   }
               </div>
               
               <div class="menu-item">
                   <label>Tamanho (Fonte):</label>
                   <div class="btn-group">
                       <button (click)="resize(el.id, -1)">-</button>
                       <span>{{ getFontSize(el) }}</span>
                       <button (click)="resize(el.id, 1)">+</button>
                   </div>
               </div>
               
               <div class="menu-separator"></div>
               
               <div class="menu-item danger" (click)="remove(el.id)">
                   <span>🗑️ Excluir</span>
               </div>
           }
        </div>
      }
    </div>
  `,
  styleUrl: './canvas.component.css'

})
export class CanvasComponent {
  @ViewChild('canvasEl') canvasEl!: ElementRef<HTMLDivElement>;

  badgeService = inject(BadgeStateService);
  elements = this.badgeService.activeElements;
  dimensions = this.badgeService.badgeDimensions;
  selectedIds = this.badgeService.selectedElementIds;
  selectedElement = this.badgeService.selectedElement;
  activeSide = this.badgeService.activeSide;
  // backgroundImage removed

  scale = signal(2.0);
  contextMenu = signal({ visible: false, x: 0, y: 0 });
  Math = Math;

  // Canvas Drag State
  // Removed manual drag state - handled by DraggableElementComponent via CDK

  // Canvas resize state
  canvasResizing = signal<string | null>(null);
  private canvasResizeStartX = 0;
  private canvasResizeStartY = 0;
  private canvasStartWidth = 0;
  private canvasStartHeight = 0;

  editingId = signal<string | null>(null);

  startEditing(id: string) {
    this.editingId.set(id);
  }

  stopEditing() {
    this.editingId.set(null);
  }

  onRightClick(event: MouseEvent, element: any) {
    event.preventDefault();
    this.badgeService.selectElement(element.id);
    this.contextMenu.set({
      visible: true,
      x: event.clientX,
      y: event.clientY
    });
  }

  onMouseUp(event: MouseEvent) {
    // Only used for clearing selection if set
  }

  /* 
     NOTE: Drag logic is now inside DraggableElementComponent using CDK.
     The wrapper is just a position holder updated by the state service.
  */

  @HostListener('document:click')
  closeMenu() {
    this.contextMenu.update(m => ({ ...m, visible: false }));
  }

  updateContent(event: Event, id: string) {
    const input = event.target as HTMLInputElement;
    this.badgeService.updateElement(id, { content: input.value });
  }

  resize(id: string, delta: number) {
    this.badgeService.resizeSelectedElement(delta);
  }

  remove(id: string) {
    this.badgeService.removeElement(id);
    this.closeMenu();
  }

  getFontSize(element: any): string {
    return element.style.fontSize || '14px';
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Delete') {
      if (this.selectedIds().length > 0) {
        this.badgeService.removeSelectedElements();
      }
    }
  }

  zoomIn() {
    this.scale.update(s => Math.min(s + 0.1, 3.0));
  }

  zoomOut() {
    this.scale.update(s => Math.max(s - 0.1, 0.5));
  }

  clearSelection(event: MouseEvent) {
    if (event.target === event.currentTarget || (event.target as HTMLElement).classList.contains('watermark')) {
      this.badgeService.clearSelection();
    }
  }

  isSelected(id: string) {
    return this.selectedIds().includes(id);
  }

  // Canvas resize via drag handles
  onCanvasResizeStart(event: MouseEvent, direction: string) {
    event.preventDefault();
    event.stopPropagation();

    this.canvasResizing.set(direction);
    this.canvasResizeStartX = event.clientX;
    this.canvasResizeStartY = event.clientY;
    this.canvasStartWidth = this.dimensions().width;
    this.canvasStartHeight = this.dimensions().height;

    const onMouseMove = (e: MouseEvent) => {
      if (!this.canvasResizing()) return;

      const deltaX = (e.clientX - this.canvasResizeStartX) / this.scale();
      const deltaY = (e.clientY - this.canvasResizeStartY) / this.scale();

      let newWidth = this.canvasStartWidth;
      let newHeight = this.canvasStartHeight;

      const dir = this.canvasResizing()!;

      // Horizontal resize
      if (dir.includes('e')) newWidth = Math.max(50, Math.min(500, this.canvasStartWidth + deltaX));
      if (dir.includes('w')) newWidth = Math.max(50, Math.min(500, this.canvasStartWidth - deltaX));

      // Vertical resize
      if (dir.includes('s')) newHeight = Math.max(50, Math.min(500, this.canvasStartHeight + deltaY));
      if (dir.includes('n')) newHeight = Math.max(50, Math.min(500, this.canvasStartHeight - deltaY));

      this.badgeService.setBadgeDimensions(Math.round(newWidth), Math.round(newHeight));
    };

    const onMouseUp = () => {
      this.canvasResizing.set(null);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}

