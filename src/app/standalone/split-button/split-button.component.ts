import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-split-button',
  imports: [MatButtonModule, MatIconModule, MatMenuModule, NgClass],
  templateUrl: './split-button.component.html',
  styleUrl: './split-button.component.scss',
})
export class SplitButtonComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) menuRef!: MatMenu;
  @Input({ required: true }) showSplitButton!: boolean;
  @Input() icon?: string;
  @Input() color = 'primary';
  @Input() disabled = false;
  @Output() clickedPrimary = new EventEmitter<void>();
}
