import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from './features/editor/editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, EditorComponent],
  template: `<app-editor></app-editor>`
})
export class AppComponent {
  title = 'frontend';
}
