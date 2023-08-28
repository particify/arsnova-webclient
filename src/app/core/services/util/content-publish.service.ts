import { Injectable } from '@angular/core';
import { ContentGroup } from '@app/core/models/content-group';

@Injectable()
export class ContentPublishService {
  isContentPublished(contentGroup: ContentGroup, contentId: string): boolean {
    if (!contentGroup.contentIds) {
      return false;
    }
    const i = contentGroup.contentIds.indexOf(contentId);
    return this.isIndexPublished(contentGroup, i);
  }

  isIndexPublished(group: ContentGroup, index: number): boolean {
    return (
      this.areContentsPublished(group) &&
      index > -1 &&
      index >= group.firstPublishedIndex &&
      (index <= group.lastPublishedIndex || group.lastPublishedIndex === -1)
    );
  }

  filterPublishedIds(contentGroup: ContentGroup): string[] {
    return (
      contentGroup.contentIds?.filter((id) =>
        this.isContentPublished(contentGroup, id)
      ) || []
    );
  }

  areContentsPublished(group: ContentGroup): boolean {
    return group.firstPublishedIndex > -1;
  }

  isSingleContentPublished(group: ContentGroup): boolean {
    return group.firstPublishedIndex === group.lastPublishedIndex;
  }

  isFirstPublished(group: ContentGroup, index: number): boolean {
    return group.firstPublishedIndex === index;
  }

  isLastPublished(group: ContentGroup, index: number): boolean {
    if (!group.contentIds) {
      return false;
    }
    return (
      group.lastPublishedIndex === index ||
      (index === group.contentIds.length - 1 && group.lastPublishedIndex === -1)
    );
  }

  isBeforeRange(group: ContentGroup, index: number): boolean {
    return index < group.firstPublishedIndex;
  }

  isDirectlyAfterRange(group: ContentGroup, index: number): boolean {
    return index === group.lastPublishedIndex + 1;
  }
}
