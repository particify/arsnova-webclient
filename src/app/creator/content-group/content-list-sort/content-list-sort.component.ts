import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { Content } from '@app/core/models/content';
import { ContentGroup } from '@app/core/models/content-group';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { DragDropBaseComponent } from '@app/shared/drag-drop-base/drag-drop-base.component';

@Component({
  selector: 'app-content-list-sort',
  templateUrl: './content-list-sort.component.html',
  styleUrls: ['./content-list-sort.component.scss'],
})
export class ContentListSortComponent
  extends DragDropBaseComponent
  implements OnInit
{
  @Input({ required: true }) contents!: Content[];
  @Input({ required: true }) contentGroup!: ContentGroup;

  firstPublishedIndex!: number;
  lastPublishedIndex!: number;

  iconList: Map<ContentType, string>;

  constructor(
    private contentService: ContentService,
    private contentPublishService: ContentPublishService
  ) {
    super();
    this.iconList = this.contentService.getTypeIcons();
  }

  ngOnInit() {
    this.dragDroplist = this.contents;
    this.firstPublishedIndex = this.contentGroup.firstPublishedIndex;
    this.lastPublishedIndex = this.contentGroup.lastPublishedIndex;
  }

  dropContent(event: CdkDragDrop<Content[]>) {
    const current = event.currentIndex;
    const prev = event.previousIndex;
    this.moveItem(prev, current);
    this.sortPublishedIndexes(prev, current);
  }

  sortPublishedIndexes(prev: number, current: number) {
    if (this.firstPublishedIndex !== -1 && this.lastPublishedIndex !== -1) {
      if (this.publishedRangeHasChanged(prev, current)) {
        this.setNewRange(prev, current);
      }
    }
  }

  setNewRange(prev: number, current: number) {
    if (this.firstPublishedIndex === this.lastPublishedIndex) {
      this.setRangeForSingleContent(prev, current);
    } else {
      this.setRangeForMultipleContents(prev, current);
    }
  }

  setRangeForSingleContent(prev: number, current: number) {
    const publishedIndex = this.firstPublishedIndex;
    if (prev === publishedIndex) {
      this.setTempRange(current, current);
    } else {
      const newPublishedIndex =
        prev < publishedIndex ? publishedIndex - 1 : publishedIndex + 1;
      this.setTempRange(newPublishedIndex, newPublishedIndex);
    }
  }

  setRangeForMultipleContents(prev: number, current: number) {
    if (this.isInCurrentRange(prev)) {
      this.setNewRangeInCurrentRange(current);
    } else {
      if (this.isOutsideOfCurrentRange(prev, current)) {
        this.setNewRangeOutsideOfCurrentRange(prev);
      } else {
        if (
          current <= this.firstPublishedIndex ||
          current >= this.lastPublishedIndex
        ) {
          const adjustment = this.isBelowRange(prev) ? -1 : 1;
          this.setTempRange(
            this.firstPublishedIndex + adjustment,
            this.lastPublishedIndex + adjustment
          );
        }
      }
    }
  }

  isOutsideOfCurrentRange(prev: number, current: number) {
    return (
      this.isInRangeExclusive(current) ||
      (this.isAboveRange(prev) && this.isEnd(current)) ||
      (this.isBelowRange(prev) && this.isStart(current))
    );
  }

  setNewRangeInCurrentRange(current: number) {
    if (!this.isInRangeExclusive(current)) {
      if (this.isAboveRange(current)) {
        this.setTempRange(
          this.firstPublishedIndex,
          this.lastPublishedIndex - 1
        );
      } else if (this.isBelowRange(current)) {
        this.setTempRange(
          this.firstPublishedIndex + 1,
          this.lastPublishedIndex
        );
      }
    }
  }

  setNewRangeOutsideOfCurrentRange(prev: number) {
    if (this.isBelowRange(prev)) {
      this.setTempRange(this.firstPublishedIndex - 1, this.lastPublishedIndex);
    } else if (this.isAboveRange(prev)) {
      this.setTempRange(this.firstPublishedIndex, this.lastPublishedIndex + 1);
    }
  }

  publishedRangeHasChanged(prev: number, current: number): boolean {
    return (
      prev !== current &&
      !(
        (this.isAboveRange(prev) && this.isAboveRange(current)) ||
        (this.isBelowRange(prev) && this.isBelowRange(current))
      )
    );
  }

  isInRangeExclusive(index: number): boolean {
    return index < this.lastPublishedIndex && index > this.firstPublishedIndex;
  }

  isInCurrentRange(index: number): boolean {
    return (
      index <= this.lastPublishedIndex && index >= this.firstPublishedIndex
    );
  }

  setTempRange(first: number, last: number) {
    this.firstPublishedIndex = first;
    this.lastPublishedIndex = last;
    this.contentGroup.firstPublishedIndex = this.firstPublishedIndex;
    this.contentGroup.lastPublishedIndex = this.lastPublishedIndex;
  }

  isBelowRange(index: number): boolean {
    return index < this.firstPublishedIndex;
  }

  isAboveRange(index: number): boolean {
    return index > this.lastPublishedIndex;
  }

  isStart(index: number): boolean {
    return index === this.firstPublishedIndex;
  }

  isEnd(index: number): boolean {
    return (
      index === this.lastPublishedIndex ||
      (this.lastPublishedIndex === -1 && index === this.contents.length - 1)
    );
  }

  isPublished(index: number): boolean {
    // Using this.firstPublishedIndex and this.lastPublishedIndex here to show correct state for sorting mode as well
    const group = new ContentGroup();
    group.firstPublishedIndex = this.firstPublishedIndex;
    group.lastPublishedIndex = this.lastPublishedIndex;
    return this.contentPublishService.isIndexPublished(group, index);
  }
}
