import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { Content } from '@app/core/models/content';
import { ContentGroup } from '@app/core/models/content-group';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { DragDropBaseComponent } from '@app/standalone/drag-drop-base/drag-drop-base.component';

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
  }

  dropContent(event: CdkDragDrop<Content[]>) {
    const current = event.currentIndex;
    const prev = event.previousIndex;
    this.moveItem(prev, current);
    this.updatePublishingIndex(prev, current);
  }

  updatePublishingIndex(prev: number, current: number): void {
    if (this.contentPublishService.isGroupLocked(this.contentGroup)) {
      return;
    }
    if (this.contentPublishService.hasSpecificPublishing(this.contentGroup)) {
      if (prev === this.contentGroup.publishingIndex) {
        this.contentGroup.publishingIndex = current;
      } else if (
        prev < this.contentGroup.publishingIndex &&
        current >= this.contentGroup.publishingIndex
      ) {
        this.contentGroup.publishingIndex--;
      } else if (
        prev > this.contentGroup.publishingIndex &&
        current <= this.contentGroup.publishingIndex
      ) {
        this.contentGroup.publishingIndex++;
      }
    }
  }

  isPublished(index: number): boolean {
    return this.contentPublishService.isIndexPublished(
      this.contentGroup,
      index
    );
  }
}
