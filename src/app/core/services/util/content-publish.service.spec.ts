import { ContentGroup, PublishingMode } from '@app/core/models/content-group';
import { ContentPublishService } from './content-publish.service';
import { configureTestModule } from '@testing/test.setup';

describe('PublishContentService', () => {
  let service: ContentPublishService;
  beforeEach(() => {
    const testBed = configureTestModule([], [ContentPublishService]);
    service = testBed.inject(ContentPublishService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Check if published

  it('should detect content as published if all contents are published with mode ALL', () => {
    const contentGroup = new ContentGroup();
    contentGroup.published = true;
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.publishingMode = PublishingMode.ALL;
    const isPublished = service.isIndexPublished(contentGroup, 2);
    expect(isPublished).toBe(true);
  });

  it('should detect content as published if all contents are published with mode UP_TO', () => {
    const contentGroup = new ContentGroup();
    contentGroup.published = true;
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.publishingMode = PublishingMode.UP_TO;
    contentGroup.publishingIndex = 4;
    const isPublished = service.isIndexPublished(contentGroup, 2);
    expect(isPublished).toBe(true);
  });

  it('should detect content as published if content is before publishedIndex when mode is UP_TO', () => {
    const contentGroup = new ContentGroup();
    contentGroup.published = true;
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.publishingMode = PublishingMode.UP_TO;
    contentGroup.publishingIndex = 3;
    const isPublished = service.isIndexPublished(contentGroup, 2);
    expect(isPublished).toBe(true);
  });

  it('should detect content as published if content index is publishedIndex when mode is UP_TO', () => {
    const contentGroup = new ContentGroup();
    contentGroup.published = true;
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.publishingMode = PublishingMode.UP_TO;
    contentGroup.publishingIndex = 2;
    const isPublished = service.isIndexPublished(contentGroup, 2);
    expect(isPublished).toBe(true);
  });

  // Check if locked

  it('should detect content as locked if all contents are locked with mode NONE', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.published = false;
    contentGroup.publishingIndex = 2;
    const isPublished = service.isIndexPublished(contentGroup, 2);
    expect(isPublished).toBe(false);
  });

  it('should detect content as locked if content is after publishedIndex with mode UP_TO', () => {
    const contentGroup = new ContentGroup();
    contentGroup.published = true;
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.publishingMode = PublishingMode.UP_TO;
    contentGroup.publishingIndex = 1;
    const isPublished = service.isIndexPublished(contentGroup, 2);
    expect(isPublished).toBe(false);
  });

  // Check if content id list is filtered correctly by publishing state

  it('should return list of all content ids if all contents are published with mode ALL', () => {
    const contentGroup = new ContentGroup();
    contentGroup.published = true;
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.publishingMode = PublishingMode.ALL;
    const publishedContentIds = service.filterPublishedIds(contentGroup);
    expect(publishedContentIds).toEqual(['0', '1', '2', '3', '4']);
  });

  it('should return list of content ids published with publishedIndex and mode UP_TO', () => {
    const contentGroup = new ContentGroup();
    contentGroup.published = true;
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.publishingMode = PublishingMode.UP_TO;
    contentGroup.publishingIndex = 2;
    const publishedContentIds = service.filterPublishedIds(contentGroup);
    expect(publishedContentIds).toEqual(['0', '1', '2']);
  });

  // Check if publishing modes of group are detected correctly

  it('should detect that group is locked with published false', () => {
    const contentGroup = new ContentGroup();
    contentGroup.published = false;
    const isLocked = service.isGroupLocked(contentGroup);
    expect(isLocked).toEqual(true);
  });

  it('should detect that group is published with mode ALL', () => {
    const contentGroup = new ContentGroup();
    contentGroup.published = true;
    contentGroup.publishingMode = PublishingMode.ALL;
    const isLocked = service.isGroupLocked(contentGroup);
    expect(isLocked).toEqual(false);
  });

  it('should detect that group is published with mode UP_TO', () => {
    const contentGroup = new ContentGroup();
    contentGroup.published = true;
    contentGroup.publishingMode = PublishingMode.UP_TO;
    const isLocked = service.isGroupLocked(contentGroup);
    expect(isLocked).toEqual(false);
  });

  it('should detect that group has published range with publishing mode UP_TO', () => {
    const contentGroup = new ContentGroup();
    contentGroup.published = true;
    contentGroup.publishingMode = PublishingMode.UP_TO;
    const isRangePublished = service.isRangePublished(contentGroup);
    expect(isRangePublished).toEqual(true);
  });
});
