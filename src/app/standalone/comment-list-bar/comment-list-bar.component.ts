import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { CommentFilter } from '@app/core/models/comment-filter.enum';
import { CommentPeriod } from '@app/core/models/comment-period.enum';
import { CommentSort } from '@app/core/models/comment-sort.enum';
import { MenuDividerComponent } from '@app/standalone/menu-divider/menu-divider.component';

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
  standalone: true,
  imports: [CoreModule, MenuDividerComponent],
  selector: 'app-comment-list-bar',
  templateUrl: './comment-list-bar.component.html',
  styleUrls: ['./comment-list-bar.component.scss'],
})
export class CommentListBarComponent {
  @ViewChild('searchInput') searchInput: ElementRef;

  @Input() scroll: boolean;
  @Input() scrollActive: boolean;
  @Input() isScrollStart: boolean;
  @Input() commentCounter: number;
  @Input() showAlways = false;
  @Input() isAddButtonDisabled: boolean;
  @Input() currentFilter: CommentFilter;
  @Input() currentSort: CommentSort;
  @Input() period: CommentPeriod;
  @Input() navBarExists = true;

  @Output() searchInputChanged = new EventEmitter<string>();
  @Output() createCommentClicked = new EventEmitter<void>();
  @Output() filterSelected = new EventEmitter<CommentFilter>();
  @Output() sortingSelected = new EventEmitter<CommentSort>();
  @Output() periodSelected = new EventEmitter<CommentPeriod>();

  searchActive = false;
  searchData = '';
  CommentFilter = CommentFilter;
  periodsList = Object.values(CommentPeriod);

  sortItems: SortItem[] = [
    new SortItem(CommentSort.TIME, 'access_time', 'blue'),
    new SortItem(CommentSort.VOTEDESC, 'keyboard_arrow_up', 'green'),
    new SortItem(CommentSort.VOTEASC, 'keyboard_arrow_down', 'red'),
  ];

  search(): void {
    this.searchInputChanged.emit(this.searchData);
  }

  activateSearch() {
    this.searchActive = true;
    this.searchInput.nativeElement.focus();
  }

  resetSearch() {
    this.searchData = '';
    this.searchActive = false;
    this.searchInputChanged.emit(this.searchData);
  }

  create(): void {
    this.createCommentClicked.emit();
  }

  filter(type: CommentFilter): void {
    this.filterSelected.emit(type);
  }

  sort(type: CommentSort): void {
    this.sortingSelected.emit(type);
  }

  setTimePeriod(period: CommentPeriod) {
    this.periodSelected.emit(period);
  }
}
