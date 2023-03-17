import { Injectable } from '@angular/core';
import { ContentGroup } from '@arsnova/app/models/content-group';

@Injectable()
export class ContentPublishService {
  isContentPublished(contentGroup: ContentGroup, contentId: string) {
    const i = contentGroup.contentIds.indexOf(contentId);
    return this.isIndexPublished(contentGroup, i);
  }

  isIndexPublished(group: ContentGroup, index): boolean {
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

  areContentsPublished(group: ContentGroup) {
    return group.firstPublishedIndex > -1;
  }

  isSingleContentPublished(group: ContentGroup) {
    return group.firstPublishedIndex === group.lastPublishedIndex;
  }

  isFirstPublished(group: ContentGroup, index: number) {
    return group.firstPublishedIndex === index;
  }

  isLastPublished(group: ContentGroup, index: number) {
    return (
      group.lastPublishedIndex === index ||
      (index === group.contentIds.length - 1 && group.lastPublishedIndex === -1)
    );
  }

  isBeforeRange(group: ContentGroup, index: number) {
    return index < group.firstPublishedIndex;
  }

  isDirectlyAfterRange(group: ContentGroup, index: number) {
    return index === group.lastPublishedIndex + 1;
  }
}
