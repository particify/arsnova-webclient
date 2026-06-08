import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  imports: [CommonModule, MatDividerModule],
  selector: 'app-divider',
  templateUrl: './divider.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./divider.component.scss'],
})
export class DividerComponent {
  @Input() padding = false;
}
