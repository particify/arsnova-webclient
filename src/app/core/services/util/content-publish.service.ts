import { Injectable } from '@angular/core';
import { ContentGroup, PublishingMode } from '@app/core/models/content-group';

@Injectable()
export class ContentPublishService {
  isIndexPublished(contentGroup: ContentGroup, index: number): boolean {
    if (this.isGroupLocked(contentGroup)) {
      return false;
    }
    const publishingIndex = contentGroup.publishingIndex;
    switch (contentGroup.publishingMode) {
      case PublishingMode.ALL:
        return true;
      case PublishingMode.UP_TO:
      case PublishingMode.LIVE:
        return publishingIndex !== undefined && publishingIndex >= index;
      default:
        return false;
    }
  }

  filterPublishedIds(contentGroup: ContentGroup): string[] {
    return (
      contentGroup.contentIds?.filter((id, index) =>
        this.isIndexPublished(contentGroup, index)
      ) || []
    );
  }

  isGroupLocked(contentGroup: ContentGroup): boolean {
    return !contentGroup.published;
  }

  hasSpecificPublishing(contentGroup: ContentGroup): boolean {
    return this.isRangePublished(contentGroup);
  }

  isRangePublished(contentGroup: ContentGroup): boolean {
    return (
      !this.isGroupLocked(contentGroup) &&
      [PublishingMode.UP_TO, PublishingMode.LIVE].includes(
        contentGroup.publishingMode
      )
    );
  }

  isGroupLive(contentGroup: ContentGroup): boolean {
    return contentGroup.publishingMode === PublishingMode.LIVE;
  }
}
