import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-filter-chip',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule, TranslocoModule],
  templateUrl: './filter-chip.component.html',
})
export class FilterChipComponent {
  @Input({ required: true }) name!: string;
  @Input() removable = true;

  @Output() removeClicked = new EventEmitter<void>();

  remove(): void {
    this.removeClicked.emit();
  }
}
