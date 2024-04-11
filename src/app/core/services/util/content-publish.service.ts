import { Injectable } from '@angular/core';
import { ContentGroup, PublishingMode } from '@app/core/models/content-group';

@Injectable()
export class ContentPublishService {
  isIndexPublished(contentGroup: ContentGroup, index: number): boolean {
    const publishingIndex = contentGroup.publishingIndex;
    switch (contentGroup.publishingMode) {
      case PublishingMode.ALL:
        return true;
      case PublishingMode.SINGLE:
        return publishingIndex === index;
      case PublishingMode.UP_TO:
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
    return contentGroup.publishingMode === PublishingMode.NONE;
  }

  hasSpecificPublishing(contentGroup: ContentGroup): boolean {
    return (
      this.isSinglePublished(contentGroup) ||
      this.isRangePublished(contentGroup)
    );
  }

  isRangePublished(contentGroup: ContentGroup): boolean {
    return contentGroup.publishingMode === PublishingMode.UP_TO;
  }

  isSinglePublished(contentGroup: ContentGroup): boolean {
    return contentGroup.publishingMode === PublishingMode.SINGLE;
  }
}
