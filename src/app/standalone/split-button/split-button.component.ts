import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuPanel } from '@angular/material/menu';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-split-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, TranslocoPipe, MatMenuModule],
  templateUrl: './split-button.component.html',
  styleUrl: './split-button.component.scss',
})
export class SplitButtonComponent {
  @Input({ required: true }) label!: string;
  @Input() icon?: string;
  @Input() color = 'primary';
  @Input({ required: true }) menuRef!: MatMenuPanel;
  @Output() clickedPrimary = new EventEmitter<void>();
}
