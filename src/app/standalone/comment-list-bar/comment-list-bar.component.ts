import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { CommentFilter } from '@app/core/models/comment-filter.enum';
import { CommentPeriod } from '@app/core/models/comment-period.enum';
import { CommentSort } from '@app/core/models/comment-sort.enum';
import { FilterChipComponent } from '@app/standalone/filter-chip/filter-chip.component';

class SortItem {
  name: CommentSort;
  icon: string;
  activeClass: string;

  constructor(name: CommentSort, icon: string, activeClass: string) {
    this.name = name;
    this.icon = icon;
    this.activeClass = activeClass;
  }
}

@Component({
  imports: [CoreModule, FilterChipComponent],
  selector: 'app-comment-list-bar',
  templateUrl: './comment-list-bar.component.html',
  styleUrls: ['./comment-list-bar.component.scss'],
})
export class CommentListBarComponent {
  @Input() showFixedBar = false;
  @Input() commentCounter = 0;
  @Input() isAddButtonDisabled = false;
  @Input() currentFilter?: CommentFilter;
  @Input() currentSort = CommentSort.TIME;
  @Input() period = CommentPeriod.ALL;
  @Input() navBarExists = true;
  @Input() showAddButton = false;
  @Input() categories?: string[];
  @Input() selectedCategory?: string;
  @Input() searchInput = '';

  @Output() searchInputChanged = new EventEmitter<string>();
  @Output() createCommentClicked = new EventEmitter<void>();
  @Output() filterSelected = new EventEmitter<CommentFilter>();
  @Output() sortingSelected = new EventEmitter<CommentSort>();
  @Output() periodSelected = new EventEmitter<CommentPeriod>();
  @Output() categorySelected = new EventEmitter<string>();

  CommentFilter = CommentFilter;
  CommentPeriod = CommentPeriod;
  periodsList = Object.values(CommentPeriod);

  sortItems: SortItem[] = [
    new SortItem(CommentSort.TIME, 'access_time', 'blue'),
    new SortItem(CommentSort.VOTEDESC, 'keyboard_arrow_up', 'green'),
    new SortItem(CommentSort.VOTEASC, 'keyboard_arrow_down', 'red'),
  ];

  search(): void {
    this.searchInputChanged.emit(this.searchInput);
  }

  resetSearch() {
    this.searchInput = '';
    this.search();
  }

  create(): void {
    this.createCommentClicked.emit();
  }

  filter(type: CommentFilter): void {
    if (type === this.currentFilter) {
      this.filterSelected.emit(undefined);
    } else {
      this.filterSelected.emit(type);
    }
  }

  sort(type: CommentSort): void {
    this.sortingSelected.emit(type);
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
    this.categorySelected.emit(this.selectedCategory);
  }
}
