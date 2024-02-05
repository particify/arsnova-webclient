import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from '@angular/core';
import { ContentGroupStatistics } from '@app/core/models/content-group-statistics';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-content-group-title',
  templateUrl: './content-group-title.component.html',
  styleUrls: ['./content-group-title.component.scss'],
})
export class ContentGroupTitleComponent implements OnChanges {
  @ViewChild('nameInput') nameInput!: ElementRef;

  @Output() seriesNameChanged = new EventEmitter<string>();

  @Input() disabled = false;
  @Input({ required: true }) seriesName!: string;
  @Input({ required: true }) contentGroupStats!: ContentGroupStatistics[];
  updatedName = '';
  isInTitleEditMode = false;
  inputFocus = false;

  constructor(
    private translateService: TranslocoService,
    private notificationService: NotificationService
  ) {}

  ngOnChanges(): void {
    this.updatedName = this.seriesName;
  }

  goInTitleEditMode(): void {
    this.updatedName = this.seriesName;
    this.isInTitleEditMode = true;
    this.nameInput.nativeElement.selectionStart = this.updatedName.length;
  }

  leaveTitleEditMode(): void {
    this.isInTitleEditMode = false;
    this.saveSeriesName();
  }

  removeFocusFromInput() {
    this.nameInput.nativeElement.blur();
  }

  saveSeriesName(): void {
    if (this.updatedName !== this.seriesName && this.isNoDuplicateName()) {
      this.seriesNameChanged.emit(this.updatedName);
    }
  }

  isNoDuplicateName() {
    const seriesNames = this.contentGroupStats.map((s) => s.groupName);
    if (seriesNames.includes(this.updatedName)) {
      this.updatedName = this.seriesName;
      const msg = this.translateService.translate(
        'creator.content.duplicate-series-name'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.FAILED);
      return false;
    } else {
      return true;
    }
  }
}
