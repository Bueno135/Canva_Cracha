import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeStateService } from '../../../../core/services/badge-state.service';
import { BadgeSide, ShapeType } from '../../../../core/models/badge.model';

@Component({
  selector: 'app-sidebar-elements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sidebar">
      <!-- 1. Template Name -->
      <div class="section">
        <h3>Template</h3>
        <input 
          type="text" 
          class="template-input"
          placeholder="Nome do Template"
          [ngModel]="badgeService.templateName()"
          (ngModelChange)="badgeService.setTemplateName($event)"
        >
      </div>

      <!-- 2. Slots -->
      <div class="section">
        <h3>Slots</h3>
        <div class="slot-selector">
          <button 
            *ngFor="let slot of [1, 2, 3]" 
            [class.active]="badgeService.currentSlot() === slot"
            (click)="selectSlot(slot)"
          >
            Slot {{ slot }}
          </button>
        </div>
        <button class="load-btn" (click)="loadCurrentSlot()">Carregar Template</button>
      </div>

      <!-- 3. Side -->
      <div class="section">
        <h3>Lado do Crachá</h3>
        <div class="toggle-group">
          <button [class.active]="activeSide() === 'front'" (click)="setSide('front')">Frente</button>
          <button [class.active]="activeSide() === 'back'" (click)="setSide('back')">Verso</button>
        </div>
      </div>

      <!-- 4. Size (CM) -->
      <div class="section">
        <h3>Tamanho do Template (cm)</h3>
        <div class="size-inputs-row">
           <div class="size-field">
             <label>Largura</label>
             <input type="number" [ngModel]="cmWidth" (ngModelChange)="updateCmWidth($event)" step="0.1">
           </div>
           <div class="size-field">
             <label>Altura</label>
             <input type="number" [ngModel]="cmHeight" (ngModelChange)="updateCmHeight($event)" step="0.1">
           </div>
        </div>

        <div class="template-presets">
          <button class="preset-btn" (click)="setTemplateSizeCm(5.4, 8.6)" title="Padrão Vertical (5.4 x 8.6 cm)">
            <div class="preset-icon vertical"></div>
            <span>Retrato</span>
          </button>
          <button class="preset-btn" (click)="setTemplateSizeCm(8.6, 5.4)" title="Paisagem (8.6 x 5.4 cm)">
            <div class="preset-icon horizontal"></div>
            <span>Paisagem</span>
          </button>
           <button class="preset-btn" (click)="setTemplateSizeCm(10, 15)" title="Crachá Grande (10 x 15 cm)">
            <div class="preset-icon tall"></div>
            <span>Evento</span>
          </button>
        </div>
        <small style="display: block; margin-top: 0.5rem; color: #888; font-size: 0.7rem;">
            {{ badgeService.badgeDimensions().width }}px × {{ badgeService.badgeDimensions().height }}px
        </small>
      </div>

      <!-- 5. Elements (Unified) -->
      <!-- 5. Elements -->
      <div class="section">
        <h3>Elementos</h3>
        <div class="elements-stack">
          <!-- Row 1: Text -->
          <button (click)="addText()" class="full-width-btn">
            <span class="icon">📝</span> 
            <span>Texto</span>
          </button>
          
          <!-- Row 2: Photo -->
          <button (click)="addPhoto()" class="full-width-btn">
            <span class="icon">👤</span> 
            <span>Foto de Perfil</span>
          </button>

          <!-- Row 3: Image -->
          <button (click)="triggerImagePicker()" class="full-width-btn">
            <span class="icon">🖼️</span> 
            <span>Imagem do Sistema</span>
          </button>
          <input 
            #imageInput
            type="file" 
            accept="image/*" 
            (change)="onImageSelected($event)"
            style="display: none;"
          >

          <!-- Row 4: Shapes -->
          <div class="shapes-section">
             <label>Formas Básicas</label>
             <div class="shape-grid">
                <button (click)="addShape('rectangle')" title="Retângulo/Quadrado">
                    <div class="shape-icon square"></div>
                </button>
                <button (click)="addShape('circle')" title="Círculo/Oval">
                    <div class="shape-icon circle"></div>
                </button>
                <button (click)="addShape('triangle')" title="Triângulo">
                    <div class="shape-icon triangle"></div>
                </button>
             </div>
          </div>
        </div>
      </div>
      
      <div class="section spacer"></div>

      <div class="section">
          <button class="primary-btn" (click)="save()">Salvar Template</button>
      </div>
    </div>
  `,
  styleUrl: './sidebar-elements.component.css'

})
export class SidebarElementsComponent {
  badgeService = inject(BadgeStateService);
  activeSide = this.badgeService.activeSide;

  @ViewChild('backgroundInput') backgroundInput!: ElementRef<HTMLInputElement>;
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;

  // Getters for CM conversion
  get cmWidth(): number {
    return parseFloat((this.badgeService.badgeDimensions().width / this.badgeService.PIXELS_PER_CM).toFixed(1));
  }

  get cmHeight(): number {
    return parseFloat((this.badgeService.badgeDimensions().height / this.badgeService.PIXELS_PER_CM).toFixed(1));
  }

  updateCmWidth(cm: number) {
    const px = Math.round(cm * this.badgeService.PIXELS_PER_CM);
    this.badgeService.setBadgeDimensions(px, this.badgeService.badgeDimensions().height);
  }

  updateCmHeight(cm: number) {
    const px = Math.round(cm * this.badgeService.PIXELS_PER_CM);
    this.badgeService.setBadgeDimensions(this.badgeService.badgeDimensions().width, px);
  }

  selectSlot(slot: number) {
    this.badgeService.setSlot(slot);
  }

  loadCurrentSlot() {
    this.badgeService.loadTemplateBySlot(this.badgeService.currentSlot());
  }

  addText() {
    this.badgeService.addElement('text', 'Novo Texto');
  }

  addShape(type: ShapeType) {
    this.badgeService.addShapeElement(type);
  }

  // Unified Text/Tag handled in Properties Panel, here just "Add Text"
  // addTag removed as per plan

  addPhoto() {
    this.badgeService.addPhotoElement('square');
  }

  triggerImagePicker() {
    this.imageInput.nativeElement.click();
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        this.badgeService.addElement('image', dataUrl);
      };
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  triggerBackgroundPicker() {
    this.backgroundInput.nativeElement.click();
  }

  onBackgroundSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const dims = this.badgeService.badgeDimensions();

        // Add as an image element, full size, at bottom
        this.badgeService.addElement(
          'image',
          dataUrl,
          undefined, // no photo shape
          { objectFit: 'fill' }, // style overrides
          { width: dims.width, height: dims.height, x: 0, y: 0, zIndex: 0 }
        );
      };
      reader.readAsDataURL(file);
    }

    input.value = '';
  }

  setSide(side: BadgeSide) {
    this.badgeService.setSide(side);
  }

  setTemplateSizeCm(widthCm: number, heightCm: number) {
    const w = Math.round(widthCm * this.badgeService.PIXELS_PER_CM);
    const h = Math.round(heightCm * this.badgeService.PIXELS_PER_CM);
    this.badgeService.setBadgeDimensions(w, h);
  }

  save() {
    this.badgeService.saveTemplate();
  }
}

