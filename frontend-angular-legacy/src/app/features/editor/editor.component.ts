import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarElementsComponent } from './components/sidebar/sidebar-elements.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { PropertiesPanelComponent } from './components/properties-panel/properties-panel.component';
import { PreviewDialogComponent } from './components/preview-dialog/preview-dialog.component';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, SidebarElementsComponent, CanvasComponent, PropertiesPanelComponent, PreviewDialogComponent],
  template: `
    <div class="editor-layout">
      <header class="top-bar">
        <div class="brand">
            <span class="logo-icon">☰</span> 
            <span class="app-name">iBolt</span>
        </div>
        
        <div class="toolbar-actions">
           <button class="btn-primary" (click)="showPreview.set(true)">
             👁️ Visualizar Impressão
           </button>
        </div>

        <div class="company-logo">Aegea</div>
      </header>
      <div class="workspace">
        <!-- Mock Navigation Sidebar (iBolt Style) -->
        <div class="main-nav">
           <div class="nav-group">
               <div class="nav-header">Aegea</div>
               <div class="nav-item">
                   <span class="icon">💼</span> Empresa
               </div>
               <div class="nav-item">
                   <span class="icon">👥</span> Funcionários
               </div>
               <div class="nav-item active">
                   <span class="icon">💳</span> Crachá
               </div>
               <div class="nav-item">
                   <span class="icon">👤</span> Usuários
               </div>
           </div>
        </div>

        <div class="sidebar-wrapper">
          <app-sidebar-elements></app-sidebar-elements>
        </div>
        <div class="canvas-wrapper">
          <app-canvas></app-canvas>
        </div>
        <div class="properties-wrapper">
          <app-properties-panel></app-properties-panel>
        </div>
      </div>
      
      @if (showPreview()) {
        <app-preview-dialog (close)="showPreview.set(false)"></app-preview-dialog>
      }
    </div>
  `,
  styleUrl: './editor.component.css'

})
export class EditorComponent {
  showPreview = signal(false);
}
