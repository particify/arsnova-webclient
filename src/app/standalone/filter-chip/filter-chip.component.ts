import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-filter-chip',
  imports: [MatChipsModule, MatIconModule, TranslocoModule],
  changeDetection: ChangeDetectionStrategy.Eager,
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
