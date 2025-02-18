import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { CommentFilter } from '@app/core/models/comment-filter.enum';
import { CommentPeriod } from '@app/core/models/comment-period.enum';

@Component({
  imports: [CoreModule],
  selector: 'app-comment-filter',
  templateUrl: './comment-filter.component.html',
  styleUrls: ['./comment-filter.component.scss'],
})
export class CommentFilterComponent {
  @Input() currentFilter?: CommentFilter;
  @Input() period = CommentPeriod.ALL;
  @Input() categories?: string[];
  @Input() selectedCategory?: string;
  @Input() useIconButton = true;
  @Input() useExtraPadding = true;

  @Output() filterSelected = new EventEmitter<CommentFilter>();
  @Output() periodSelected = new EventEmitter<CommentPeriod>();
  @Output() categorySelected = new EventEmitter<string>();

  CommentFilter = CommentFilter;
  CommentPeriod = CommentPeriod;
  periodsList = Object.values(CommentPeriod);

  filter(type: CommentFilter): void {
    if (type === this.currentFilter) {
      this.filterSelected.emit(undefined);
    } else {
      this.categorySelected.emit();
      this.filterSelected.emit(type);
    }
  }

  setTimePeriod(period: CommentPeriod) {
    this.periodSelected.emit(period);
  }

  selectCategory(category?: string): void {
    if (category && this.selectedCategory !== category) {
      this.selectedCategory = category;
    } else {
      this.selectedCategory = undefined;
    }
    this.filterSelected.emit();
    this.categorySelected.emit(this.selectedCategory);
  }
}
