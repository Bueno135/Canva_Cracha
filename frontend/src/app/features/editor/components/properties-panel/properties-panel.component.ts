import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeStateService } from '../../../../core/services/badge-state.service';
import { PhotoShape } from '../../../../core/models/badge.model';

@Component({
  selector: 'app-properties-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="panel">
      <h3>Propriedades</h3>
      
      @if (selectedElement(); as element) {
        <div class="property-group">
          <label>Tipo</label>
          <div class="value-display">{{ element.type | titlecase }}</div>
        </div>

        <!-- Text Type Switch for Text Elements -->
        @if (element.type === 'text' && element.content !== '{{foto}}') {
            <div class="property-group">
                <label>Tipo de Texto</label>
                <select [ngModel]="isDynamic(element.content) ? 'dynamic' : 'static'" (ngModelChange)="onTextTypeChange($event, element.id)">
                    <option value="static">Texto Estático</option>
                    <option value="dynamic">Campo Dinâmico (Tag)</option>
                </select>
            </div>
        }

        <div class="property-group">
          <label>Conteúdo</label>
          
          @if (element.type === 'qr') {
            <input type="text" [ngModel]="element.content" (ngModelChange)="updateContent($event, element.id)" placeholder="URL ou texto para QR">
            <small>Texto ou URL para gerar QR Code</small>

          } @else if (element.content === '{{foto}}') {
            <div class="value-display">👤 Foto do Funcionário</div>
            <small>Referência à foto do funcionário</small>

          } @else if (element.type === 'image') {
            <div class="image-preview" *ngIf="element.content.startsWith('data:') || element.content.startsWith('http')">
                <img [src]="element.content" alt="Preview" style="max-width: 100%; max-height: 100px; object-fit: contain; border: 1px solid #eee;">
            </div>
            <!-- Allow replacing image URL if needed, but usually done via upload -->
            <!-- <small>Imagem carregada</small> -->

          } @else if (element.type === 'shape') {
             <div class="value-display">Forma Geométrica</div>

          } @else if (element.type === 'text') {
             <!-- Logic based on IsDynamic -->
             @if (isDynamic(element.content)) {
                 <select [ngModel]="element.content" (ngModelChange)="updateContent($event, element.id)">
                     <option value="" disabled>Selecione um campo...</option>
                     @for (field of employeeFields; track field.value) {
                         <option [value]="field.value">{{ field.label }}</option>
                     }
                 </select>
             } @else {
                 <textarea [ngModel]="element.content" (ngModelChange)="updateContent($event, element.id)" rows="3"></textarea>
             }
          }
        </div>

        <!-- Shape Properties -->
        @if (element.type === 'shape') {
           <div class="property-group">
            <label>Estilo da Forma</label>
            <div class="row">
               <label style="font-size: 0.8em; width: 60px;">Cor:</label>
               <input type="color" 
                      [ngModel]="element.fillColor || '#4f46e5'" 
                      (ngModelChange)="updateFillColor($event, element.id)">
            </div>
            
            <div class="row" style="margin-top: 5px;">
               <label style="font-size: 0.8em; width: 60px;">Borda:</label>
               <input type="color" 
                      [ngModel]="element.borderColor || '#000000'" 
                      (ngModelChange)="updateBorderColor($event, element.id)">
                      
               <input type="number" 
                      [ngModel]="element.borderWidth || 0" 
                      (ngModelChange)="updateBorderWidth($event, element.id)"
                      min="0" max="20" 
                      style="width: 50px; margin-left: 5px;">
               <span style="font-size: 0.75rem; color: #888;">px</span>
            </div>
           </div>
        }

        @if (element.content === '{{foto}}') {
          <div class="property-group">
            <label>Forma</label>
            <select [ngModel]="element.photoShape || 'square'" (ngModelChange)="updatePhotoShape($event, element.id)">
              <option value="circle">Círculo</option>
              <option value="square">Quadrado</option>
            </select>
          </div>

          <div class="property-group">
            <label>Borda</label>
             <!-- Using borderWidth as boolean toggle equivalent for UI simplicity if desired, or simplified -->
               <div class="row" style="margin-top: 0.5rem;">
                 <label style="font-size: 0.8em; margin-right: 5px;">Cor:</label>
                 <input type="color" 
                        [ngModel]="element.borderColor || '#333333'" 
                        (ngModelChange)="updateBorderColor($event, element.id)">
                        
                 <label style="font-size: 0.8em; margin-right: 5px; margin-left: 10px;">Largura:</label>
                 <input type="number" 
                        [ngModel]="element.borderWidth || 0" 
                        (ngModelChange)="updateBorderWidth($event, element.id)"
                        min="0" max="20" 
                        style="width: 50px">
                 <span style="font-size: 0.75rem; color: #888;">px</span>
               </div>
          </div>
        }

        <div class="property-group">
          <label>Tamanho</label>
          <div class="row">
            <div class="field">
              <span>L</span>
              <input type="number" [ngModel]="element.width" (ngModelChange)="updateWidth($event, element.id)">
            </div>
            <div class="field">
              <span>A</span>
              <input type="number" [ngModel]="element.height" (ngModelChange)="updateHeight($event, element.id)">
            </div>
          </div>
        </div>

         <div class="property-group">
          <label>Posição</label>
          <div class="row">
            <div class="field">
              <span>X</span>
              <input type="number" [ngModel]="element.x" (ngModelChange)="updateX($event, element.id)">
            </div>
            <div class="field">
              <span>Y</span>
              <input type="number" [ngModel]="element.y" (ngModelChange)="updateY($event, element.id)">
            </div>
          </div>
        </div>

        @if (element.type === 'text') {
          <!-- Font Family -->
          <div class="property-group">
            <label>Fonte</label>
            <select [ngModel]="element.style['fontFamily'] || 'Arial'" 
                    (ngModelChange)="updateStyle('fontFamily', $event, element.id)">
              @for (font of fontFamilies; track font.value) {
                <option [value]="font.value">{{ font.label }}</option>
              }
            </select>
          </div>

          <!-- Font Size -->
          <div class="property-group">
            <label>Tamanho</label>
            <div class="size-slider">
              <input type="range" min="8" max="72" 
                     [ngModel]="parseInt(element.style['fontSize'])" 
                     (ngModelChange)="updateStyle('fontSize', $event + 'px', element.id)">
              <span class="size-value">{{ parseInt(element.style['fontSize']) }}px</span>
            </div>
          </div>

          <!-- Text Decoration (Bold/Italic/Underline) -->
          <div class="property-group">
            <label>Estilo</label>
            <div class="text-style-buttons">
              <button class="style-btn" 
                      [class.active]="element.style['fontWeight'] === 'bold'"
                      (click)="toggleFontWeight(element.id)">
                <strong>B</strong>
              </button>
              <button class="style-btn" 
                      [class.active]="element.style['fontStyle'] === 'italic'"
                      (click)="toggleFontStyle(element.id)">
                <em>I</em>
              </button>
              <button class="style-btn" 
                      [class.active]="element.style['textDecoration'] === 'underline'"
                      (click)="toggleTextDecoration(element.id)">
                <u>U</u>
              </button>
            </div>
          </div>

          <!-- Text Alignment -->
          <div class="property-group">
            <label>Alinhamento</label>
            <div class="alignment-buttons">
              <button class="align-btn" 
                      [class.active]="(element.style['textAlign'] || 'left') === 'left'"
                      (click)="updateStyle('textAlign', 'left', element.id)">
                ⬅
              </button>
              <button class="align-btn" 
                      [class.active]="element.style['textAlign'] === 'center'"
                      (click)="updateStyle('textAlign', 'center', element.id)">
                ⬌
              </button>
              <button class="align-btn" 
                      [class.active]="element.style['textAlign'] === 'right'"
                      (click)="updateStyle('textAlign', 'right', element.id)">
                ➡
              </button>
              <button class="align-btn" 
                      [class.active]="element.style['textAlign'] === 'justify'"
                      (click)="updateStyle('textAlign', 'justify', element.id)">
                ☰
              </button>
            </div>
          </div>

          <!-- Colors Section -->
          <div class="property-group">
            <label>Cores</label>
            <div class="color-controls">
              <!-- Text Color -->
              <div class="color-row">
                <span class="color-label">Texto</span>
                <div class="color-picker-wrapper">
                  <div class="color-preview" 
                       [style.backgroundColor]="element.style['color'] || '#000000'"
                       (click)="textColorInput.click()">
                  </div>
                  <input #textColorInput type="color" 
                         [ngModel]="element.style['color'] || '#000000'" 
                         (ngModelChange)="updateStyle('color', $event, element.id)">
                  <div class="preset-colors">
                    @for (color of presetColors; track color) {
                      <button class="preset-color" 
                              [style.backgroundColor]="color"
                              (click)="updateStyle('color', color, element.id)">
                      </button>
                    }
                  </div>
                </div>
              </div>

              <!-- Background Color -->
              <div class="color-row">
                <span class="color-label">Fundo</span>
                <div class="color-picker-wrapper">
                  <div class="color-preview" 
                       [style.backgroundColor]="element.style['backgroundColor'] || 'transparent'"
                       [style.border]="element.style['backgroundColor'] ? 'none' : '2px dashed #ccc'"
                       (click)="bgColorInput.click()">
                    @if (!element.style['backgroundColor']) {
                      <span class="no-color">✕</span>
                    }
                  </div>
                  <input #bgColorInput type="color" 
                         [ngModel]="element.style['backgroundColor'] || '#ffffff'" 
                         (ngModelChange)="updateStyle('backgroundColor', $event, element.id)">
                  <button class="clear-bg-btn" 
                          (click)="updateStyle('backgroundColor', '', element.id)">
                    Sem fundo
                  </button>
                </div>
              </div>
            </div>
          </div>
        }

        
        <div class="actions">
             <button class="danger" (click)="deleteElement(element.id)">Excluir Elemento</button>
        </div>


      } @else {
        <div class="empty-state">
          <p>Selecione um elemento para editar</p>
          <small>Clique em qualquer item no crachá</small>
        </div>
      }
    </div>
  `,
  styleUrl: './properties-panel.component.css'

})
export class PropertiesPanelComponent {
  badgeService = inject(BadgeStateService);
  selectedElement = this.badgeService.selectedElement;

  readonly employeeFields = [
    { label: 'Nome Completo', value: '{{nome}}' },
    { label: 'Matrícula', value: '{{matricula}}' },
    { label: 'Cargo', value: '{{cargo}}' },
    { label: 'Setor', value: '{{setor}}' },
    { label: 'Empresa', value: '{{nomeEmpresa}}' },
    { label: 'Data Admissão', value: '{{dataAdmissao}}' },
    { label: 'CPF', value: '{{cpf}}' },
    { label: 'RG', value: '{{rg}}' },
    { label: 'Tipo Sanguíneo', value: '{{tipoSanguineo}}' }
  ];

  readonly fontFamilies = [
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, sans-serif' },
    { label: 'Times New Roman', value: 'Times New Roman, serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Roboto', value: 'Roboto, sans-serif' },
    { label: 'Open Sans', value: 'Open Sans, sans-serif' },
    { label: 'Montserrat', value: 'Montserrat, sans-serif' },
    { label: 'Courier New', value: 'Courier New, monospace' },
    { label: 'Impact', value: 'Impact, sans-serif' }
  ];

  readonly presetColors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#808080'
  ];

  parseInt(val: any) {
    if (typeof val === 'string') return parseInt(val.replace('px', ''));
    return val || 16;
  }

  isDynamic(content: string): boolean {
    return content.startsWith('{{') && content.endsWith('}}');
  }

  onTextTypeChange(type: 'static' | 'dynamic', id: string) {
    if (type === 'dynamic') {
      // Default to first field
      this.updateContent('{{nome}}', id);
    } else {
      this.updateContent('Novo Texto', id);
    }
  }

  updateContent(val: string, id: string) { this.badgeService.updateElement(id, { content: val }); }
  updateWidth(val: number, id: string) { this.badgeService.updateElementSize(id, val, this.selectedElement()?.height || 0); }
  updateHeight(val: number, id: string) { this.badgeService.updateElementSize(id, this.selectedElement()?.width || 0, val); }
  updateX(val: number, id: string) { this.badgeService.updateElementPosition(id, val, this.selectedElement()?.y || 0); }
  updateY(val: number, id: string) { this.badgeService.updateElementPosition(id, this.selectedElement()?.x || 0, val); }
  updateStyle(key: string, val: string, id: string) { this.badgeService.updateElementStyle(id, key, val); }
  updatePhotoShape(shape: PhotoShape, id: string) { this.badgeService.updatePhotoShape(id, shape); }
  deleteElement(id: string) { this.badgeService.removeElement(id); }

  toggleFontWeight(id: string) {
    const current = this.selectedElement()?.style['fontWeight'];
    this.updateStyle('fontWeight', current === 'bold' ? 'normal' : 'bold', id);
  }

  toggleFontStyle(id: string) {
    const current = this.selectedElement()?.style['fontStyle'];
    this.updateStyle('fontStyle', current === 'italic' ? 'normal' : 'italic', id);
  }

  toggleTextDecoration(id: string) {
    const current = this.selectedElement()?.style['textDecoration'];
    this.updateStyle('textDecoration', current === 'underline' ? 'none' : 'underline', id);
  }

  updateBorderColor(color: string, id: string) {
    this.badgeService.updateElement(id, { borderColor: color });
  }

  updateBorderWidth(width: number, id: string) {
    this.badgeService.updateElement(id, { borderWidth: width });
  }

  updateFillColor(color: string, id: string) {
    this.badgeService.updateElement(id, { fillColor: color });
  }
}



