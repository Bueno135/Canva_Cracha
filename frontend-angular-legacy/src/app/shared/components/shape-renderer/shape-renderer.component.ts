
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Important for ngStyle/ngClass if needed
import { ShapeType } from '../../../core/models/badge.model';

@Component({
  selector: 'app-shape-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [style]="containerStyle">
      <!-- Triangle needs a specific clip-path on the inner or main element -->
      <!-- We can just style the main div for everything effectively -->
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    div {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }
  `]
})
export class ShapeRendererComponent {
  @Input() shapeType: ShapeType = 'rectangle';
  @Input() fillColor: string = '#4f46e5';
  @Input() borderColor: string = 'transparent';
  @Input() borderWidth: number = 0;

  get containerStyle(): Record<string, string | number> {
    const baseStyle: Record<string, string | number> = {
      backgroundColor: this.fillColor,
      border: `${this.borderWidth}px solid ${this.borderColor}`,
    };

    switch (this.shapeType) {
      case 'circle':
        baseStyle['borderRadius'] = '50%';
        break;
      case 'triangle':
        // For triangle, border acts weirdly with clip-path, but clip-path is the best way to make a triangle
        // clip-path cuts off borders usually.
        // A simple CSS triangle approach:
        baseStyle['clipPath'] = 'polygon(50% 0%, 0% 100%, 100% 100%)';
        // Remove border for triangle as standard CSS borders don't follow clip-path well without complex tricks
        // Allowing 'backgroundColor' to act as the fill.
        // If border is strictly required for triangle, we'd need SVG. 
        // For this MVP step, we'll note that borders might appear cropped on triangles.
        delete baseStyle['border'];
        break;
      case 'rectangle':
      default:
        // default rectangle
        break;
    }

    return baseStyle;
  }
}
