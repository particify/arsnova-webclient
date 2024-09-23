import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-split-button',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    TranslocoPipe,
    MatMenuModule,
    NgClass,
  ],
  templateUrl: './split-button.component.html',
  styleUrl: './split-button.component.scss',
})
export class SplitButtonComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) menuRef!: MatMenu;
  @Input({ required: true }) showSplitButton!: boolean;
  @Input() icon?: string;
  @Input() color = 'primary';
  @Output() clickedPrimary = new EventEmitter<void>();
}
