import {
  Component,
  EventEmitter,
  inject,
  input,
  Input,
  Output,
} from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { CommentFilter } from '@app/core/models/comment-filter.enum';
import { CommentSort } from '@app/core/models/comment-sort.enum';
import { FilterChipComponent } from '@app/standalone/filter-chip/filter-chip.component';
import { CommentFilterComponent } from '@app/standalone/comment-filter/comment-filter.component';
import { Tag } from '@gql/generated/graphql';
import { CommentPeriod } from '@app/core/models/comment-period.enum';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';

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
  imports: [CoreModule, FilterChipComponent, CommentFilterComponent],
  selector: 'app-comment-list-bar',
  templateUrl: './comment-list-bar.component.html',
  styleUrls: ['./comment-list-bar.component.scss'],
})
export class CommentListBarComponent {
  private readonly globalStorageService = inject(GlobalStorageService);

  @Input() showFixedBar = false;
  @Input() commentCounter = 0;
  @Input() isAddButtonDisabled = false;
  @Input() selectedFlags: CommentFilter[] = [];
  @Input() currentSort = CommentSort.TIME;
  @Input() period?: number;
  @Input() navBarExists = true;
  @Input() showAddButton = false;
  @Input() selectedTags?: Tag[];
  @Input() searchInput = '';

  @Output() searchInputChanged = new EventEmitter<string>();
  @Output() createCommentClicked = new EventEmitter<void>();
  @Output() filterSelected = new EventEmitter<CommentFilter>();
  @Output() filterRemoved = new EventEmitter<CommentFilter>();
  @Output() sortingSelected = new EventEmitter<CommentSort>();
  @Output() periodSelected = new EventEmitter<number | undefined>();
  @Output() tagSelected = new EventEmitter<string>();
  @Output() tagRemoved = new EventEmitter<string>();

  roomId = input.required<string>();

  CommentFilter = CommentFilter;

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

  selectFilter(type: CommentFilter): void {
    this.filterSelected.emit(type);
  }

  removeFilter(type: CommentFilter): void {
    this.filterRemoved.emit(type);
  }

  sort(type: CommentSort): void {
    this.sortingSelected.emit(type);
  }

  getPeriodString(period?: number) {
    switch (period) {
      case 1:
        return CommentPeriod.ONEHOUR;
      case 3:
        return CommentPeriod.THREEHOURS;
      case 24:
        return CommentPeriod.ONEDAY;
      case 168:
        return CommentPeriod.ONEWEEK;
      default:
        return CommentPeriod.ALL;
    }
  }

  setPeriod(period?: number) {
    this.periodSelected.emit(period);
  }

  selectTag(tagId: string): void {
    this.tagSelected.emit(tagId);
  }

  removeTag(tagId: string): void {
    this.tagRemoved.emit(tagId);
  }
}
