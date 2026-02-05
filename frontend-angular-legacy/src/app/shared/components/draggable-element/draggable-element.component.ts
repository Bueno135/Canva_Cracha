import { Component, Input, Output, EventEmitter, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragStart, CdkDragMove, CdkDragEnd } from '@angular/cdk/drag-drop';
import { BadgeElement } from '../../../core/models/badge.model';
import { BadgeStateService } from '../../../core/services/badge-state.service';
import { ShapeRendererComponent } from '../shape-renderer/shape-renderer.component';

@Component({
  selector: 'app-draggable-element',
  standalone: true,
  imports: [CommonModule, ShapeRendererComponent],
  template: `
    <div class="element-container" 
         (mousedown)="onMouseDown($event)"
         [class.selected]="isSelected"
         [style.width.px]="element.width" 
         [style.height.px]="element.height"
         [ngStyle]="element.style"
         [style.transform]="'rotate(' + (element.rotation || 0) + 'deg)'">
         
         <!-- NOTE: Manual Drag Implementation now used for better Zoom support -->
      
      @if (element.type === 'text') {
        @if (isEditing) {
            <textarea 
                [value]="element.content" 
                (input)="onInput($event)"
                (blur)="onBlur()"
                (keydown.enter)="$event.preventDefault(); onBlur()"
                class="edit-input"
                [style.writing-mode]="element.style['writingMode'] || 'horizontal-tb'"
                autofocus
            ></textarea>
        } @else {
            <div class="text-content">{{ element.content }}</div>
        }
      }
      
      @if (element.type === 'image' || element.type === 'qr') {
        @if (isPhotoReference()) {
          <!-- Photo reference placeholder -->
          <div class="photo-placeholder" 
               [ngClass]="getShapeClasses()"
               [style.border]="getBorderStyle()">
            <span class="photo-icon">📷</span>
            <span class="photo-label">Foto</span>
          </div>
        } @else if (isEditing && !isPhotoReference()) {
          <div class="file-picker-overlay" (click)="triggerFilePicker($event)">
            <span class="file-picker-text">📁 Escolher Arquivo</span>
            <input 
              #fileInput
              type="file" 
              accept="image/*" 
              (change)="onFileSelected($event)"
              class="hidden-file-input"
            >
          </div>
        } @else {
          @if (hasValidImage()) {
            <img [src]="element.content" alt="element" class="image-content" [ngClass]="getShapeClasses()">
          } @else {
            <div class="image-placeholder">
              <span>🖼️</span>
              <span class="placeholder-text">Clique 2x para escolher imagem</span>
            </div>
          }
        }
      }

      @if (element.type === 'shape') {
        <app-shape-renderer 
            [shapeType]="element.shapeType || 'rectangle'"
            [fillColor]="element.fillColor || '#4f46e5'"
            [borderColor]="element.borderColor || 'transparent'"
            [borderWidth]="element.borderWidth || 0">
        </app-shape-renderer>
      }
      
      @if (isSelected && !isEditing) {
        <!-- Resize Handles -->
        <div class="handle nw" (mousedown)="onResizeStart($event, 'nw')"></div>
        <div class="handle n" (mousedown)="onResizeStart($event, 'n')"></div>
        <div class="handle ne" (mousedown)="onResizeStart($event, 'ne')"></div>
        <div class="handle e" (mousedown)="onResizeStart($event, 'e')"></div> <!-- Pill -->
        <div class="handle se" (mousedown)="onResizeStart($event, 'se')"></div>
        <div class="handle sw" (mousedown)="onResizeStart($event, 'sw')"></div>
        <div class="handle w" (mousedown)="onResizeStart($event, 'w')"></div> <!-- Pill -->
        
        <!-- Rotation Handle -->
        <div class="handle rotate" (mousedown)="onRotateStart($event)">
           <svg viewBox="0 0 24 24" width="12" height="12">
             <path fill="currentColor" d="M12,18V15L15.6,18.6L12,22.2V19A7,7 0 0,1 5,12H7A5,5 0 0,0 12,17M12,6V9L8.4,5.4L12,1.8V5A7,7 0 0,1 19,12H17A5,5 0 0,0 12,7Z" />
           </svg>
        </div>
      }
    </div>
  `,
  styleUrl: './draggable-element.component.css'
})
export class DraggableElementComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @Input() scale: number = 1;

  @Input({ required: true }) element!: BadgeElement;
  @Input() isSelected = false;
  @Input() isEditing = false;
  @Output() editComplete = new EventEmitter<void>();

  private badgeService = inject(BadgeStateService);
  private elementRef = inject(ElementRef);

  // Manual Drag State
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private elmStartX = 0;
  private elmStartY = 0;
  private moveListener: any;
  private upListener: any;

  isPhotoReference(): boolean {
    return this.element.content === '{{foto}}';
  }

  getShapeClasses(): string {
    if (this.isPhotoReference() && this.element.photoShape) {
      return this.element.photoShape;
    }
    return '';
  }

  getBorderStyle(): string {
    // Removed borderEnabled check as it was removed from model.
    // If user wants borders on images, we might use element.borderWidth directly?
    // Model has borderColor/Width optionally.
    if (this.element.borderWidth && this.element.borderWidth > 0) {
      return `${this.element.borderWidth}px solid ${this.element.borderColor || '#000'}`;
    }
    return 'none';
  }


  hasValidImage(): boolean {
    const content = this.element.content;
    return content &&
      (content.startsWith('data:image') ||
        content.startsWith('http://') ||
        content.startsWith('https://'));
  }

  triggerFilePicker(event: MouseEvent) {
    event.stopPropagation();
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        this.badgeService.updateElement(this.element.id, { content: dataUrl });
        this.editComplete.emit();
      };
      reader.readAsDataURL(file);
    }
  }

  onInput(event: Event) {
    const val = (event.target as HTMLTextAreaElement).value;
    this.badgeService.updateElement(this.element.id, { content: val });
  }

  onBlur() {
    this.editComplete.emit();
  }

  // --- MANUAL DRAG IMPLEMENTATION ---

  onMouseDown(event: MouseEvent) {
    // Ignore if clicking resize handles or if in edit mode
    if ((event.target as HTMLElement).classList.contains('handle') || (event.target as HTMLElement).classList.contains('rotate-handle') || this.isEditing) {
      return;
    }

    event.preventDefault(); // Prevent text selection
    event.stopPropagation();

    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.elmStartX = this.element.x;
    this.elmStartY = this.element.y;

    this.badgeService.selectElement(this.element.id);

    // Attach global listeners
    this.moveListener = this.onDragMove.bind(this);
    this.upListener = this.onDragEnd.bind(this);
    window.addEventListener('mousemove', this.moveListener);
    window.addEventListener('mouseup', this.upListener);
  }

  onDragMove(event: MouseEvent) {
    if (!this.isDragging) return;

    // Calculate delta in screen pixels
    const dx = event.clientX - this.dragStartX;
    const dy = event.clientY - this.dragStartY;

    // Convert to canvas units by dividing by scale
    const scaledDx = dx / this.scale;
    const scaledDy = dy / this.scale;

    // Update position
    const newX = this.elmStartX + scaledDx;
    const newY = this.elmStartY + scaledDy;

    // We can update continuously or on frame.
    // For smoothness, continuous update of the model is fine if performance allows.
    // Ideally we use local transform for perf and update model on Up, but 
    // user wants "no jumping", so updating model is the "Single Source of Truth" way.
    // However, frequent model updates might trigger re-renders. 
    // Let's rely on Angular's OnPush or efficient change detection? 
    // The previous issue was "double update". Here we are the ONLY updater.
    this.badgeService.updateElementPosition(this.element.id, newX, newY);
  }

  onDragEnd() {
    this.isDragging = false;
    window.removeEventListener('mousemove', this.moveListener);
    window.removeEventListener('mouseup', this.upListener);
  }

  // --- ROTATION IMPLEMENTATION ---

  private rotateListener: any;
  private stopRotateListener: any;
  private centerRotateX = 0;
  private centerRotateY = 0;

  onRotateStart(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const rect = (this.elementRef.nativeElement as HTMLElement).getBoundingClientRect();
    this.centerRotateX = rect.left + rect.width / 2;
    this.centerRotateY = rect.top + rect.height / 2;

    this.rotateListener = this.onRotate.bind(this);
    this.stopRotateListener = this.onRotateEnd.bind(this);

    window.addEventListener('mousemove', this.rotateListener);
    window.addEventListener('mouseup', this.stopRotateListener);
  }

  onRotate(event: MouseEvent) {
    const dx = event.clientX - this.centerRotateX;
    const dy = event.clientY - this.centerRotateY;

    // Calculate angle in degrees
    // atan2 returns radians between -PI and PI. 0 is pointing right (East).
    // degrees = radians * (180/PI)
    // We add 90 deg because standard 0 is usually "Up" in UI, but math 0 is "Right".
    // Actually, let's stick to standard math.
    const radians = Math.atan2(dy, dx);
    let degrees = radians * (180 / Math.PI);

    // Snap to 5/10 degree increments for easier usage? Or stick to free rotation.
    // User requested simple rotation.
    // Add 90 degrees to align handle which is at bottom (90deg position relative to center)
    degrees = degrees - 90;

    this.badgeService.updateElement(this.element.id, { rotation: degrees });
  }

  onRotateEnd() {
    window.removeEventListener('mousemove', this.rotateListener);
    window.removeEventListener('mouseup', this.stopRotateListener);
  }


  // --- RESIZE IMPLEMENTATION ---
  // (Kept similar but ensuring event stops propagation to drag)

  private startX = 0;
  private startY = 0;
  private startWidth = 0;
  private startHeight = 0;
  private startLeft = 0;
  private startTop = 0;
  private activeHandle: string | null = null;
  private resizeListener: any;
  private stopResizeListener: any;
  private startFontSize = 14;

  onResizeStart(event: MouseEvent, handle: string) {
    event.preventDefault();
    event.stopPropagation();

    this.activeHandle = handle;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startWidth = this.element.width;
    this.startHeight = this.element.height;
    this.startLeft = this.element.x;
    this.startTop = this.element.y;
    this.startFontSize = parseInt(this.element.style['fontSize']?.toString() || '14', 10);

    this.resizeListener = this.onResize.bind(this);
    this.stopResizeListener = this.onResizeEnd.bind(this);

    window.addEventListener('mousemove', this.resizeListener);
    window.addEventListener('mouseup', this.stopResizeListener);
  }

  onResize(event: MouseEvent) {
    if (!this.activeHandle) return;

    const dx = (event.clientX - this.startX) / this.scale;
    const dy = (event.clientY - this.startY) / this.scale;

    let newWidth = this.startWidth;
    let newHeight = this.startHeight;
    let newX = this.startLeft;
    let newY = this.startTop;

    // Horizontal Resize (Pills)
    if (this.activeHandle.includes('e')) newWidth = Math.max(5, this.startWidth + dx);
    if (this.activeHandle.includes('w')) {
      newWidth = Math.max(5, this.startWidth - dx);
      newX = this.startLeft + dx;
    }

    // Vertical/Corner Resize
    if (this.activeHandle.includes('s')) newHeight = Math.max(5, this.startHeight + dy);
    if (this.activeHandle.includes('n')) {
      newHeight = Math.max(5, this.startHeight - dy);
      newY = this.startTop + dy;
    }

    // Corner Logic: Scale Aspect Ratio or Font
    const isCorner = ['nw', 'ne', 'sw', 'se'].includes(this.activeHandle);

    if (this.element.type === 'text' && isCorner) {
      // For text on corners, we scale font size proportional to height change
      const scaleFactor = newHeight / this.startHeight;
      const newFontSize = Math.max(4, Math.round(this.startFontSize * scaleFactor));

      // Update font size
      this.badgeService.updateElementStyle(this.element.id, 'fontSize', `${newFontSize}px`);
    }

    if (newWidth !== this.element.width || newHeight !== this.element.height) {
      this.badgeService.updateElementSize(this.element.id, newWidth, newHeight);
    }

    if (newX !== this.element.x || newY !== this.element.y) {
      this.badgeService.updateElementPosition(this.element.id, newX, newY);
    }
  }

  onResizeEnd() {
    this.activeHandle = null;
    window.removeEventListener('mousemove', this.resizeListener);
    window.removeEventListener('mouseup', this.stopResizeListener);
  }
}
