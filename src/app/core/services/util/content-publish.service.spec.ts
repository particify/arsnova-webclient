import { TestBed } from '@angular/core/testing';
import { ContentGroup } from '@app/core/models/content-group';
import { ContentPublishService } from './content-publish.service';

describe('PublishContentService', () => {
  let service: ContentPublishService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContentPublishService],
    });
    service = TestBed.inject(ContentPublishService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should detect content as published if all contents are published initially', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 0;
    contentGroup.lastPublishedIndex = -1;
    const isPublished = service.isContentPublished(contentGroup, '2');
    expect(isPublished).toBe(true);
  });

  it('should detect content as published if all contents are published', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 0;
    contentGroup.lastPublishedIndex = 3;
    const isPublished = service.isContentPublished(contentGroup, '2');
    expect(isPublished).toBe(true);
  });

  it('should detect content as published if content is first of published range', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 1;
    contentGroup.lastPublishedIndex = 3;
    const isPublished = service.isContentPublished(contentGroup, '1');
    expect(isPublished).toBe(true);
  });

  it('should detect content as published if content is last of published range', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 1;
    contentGroup.lastPublishedIndex = 3;
    const isPublished = service.isContentPublished(contentGroup, '3');
    expect(isPublished).toBe(true);
  });

  it('should detect content as published if content is in middle of published range', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 1;
    contentGroup.lastPublishedIndex = 3;
    const isPublished = service.isContentPublished(contentGroup, '2');
    expect(isPublished).toBe(true);
  });

  it('should detect content as locked if all contents are locked', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = -1;
    contentGroup.lastPublishedIndex = -1;
    const isPublished = service.isContentPublished(contentGroup, '2');
    expect(isPublished).toBe(false);
  });

  it('should detect content as locked if content is before published range', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 2;
    contentGroup.lastPublishedIndex = 3;
    const isPublished = service.isContentPublished(contentGroup, '1');
    expect(isPublished).toBe(false);
  });

  it('should detect content as locked if content is after published range', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 2;
    contentGroup.lastPublishedIndex = 3;
    const isPublished = service.isContentPublished(contentGroup, '4');
    expect(isPublished).toBe(false);
  });

  it('should return empty list if no contents are published', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = -1;
    contentGroup.lastPublishedIndex = -1;
    const publishedContentIds = service.filterPublishedIds(contentGroup);
    expect(publishedContentIds).toEqual([]);
  });

  it('should return list of all content ids if all contents are published initially', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 0;
    contentGroup.lastPublishedIndex = -1;
    const publishedContentIds = service.filterPublishedIds(contentGroup);
    expect(publishedContentIds).toEqual(['0', '1', '2', '3', '4']);
  });

  it('should return list of content ids in published range', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 1;
    contentGroup.lastPublishedIndex = 3;
    const publishedContentIds = service.filterPublishedIds(contentGroup);
    expect(publishedContentIds).toEqual(['1', '2', '3']);
  });

  it('should detect that contents are published if all contents are published initially', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 0;
    contentGroup.lastPublishedIndex = -1;
    const areContentsPublished = service.areContentsPublished(contentGroup);
    expect(areContentsPublished).toBe(true);
  });

  it('should detect that contents are published if range is published', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 1;
    contentGroup.lastPublishedIndex = 3;
    const areContentsPublished = service.areContentsPublished(contentGroup);
    expect(areContentsPublished).toBe(true);
  });

  it('should detect that contents are locked all contents are locked', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = -1;
    contentGroup.lastPublishedIndex = -1;
    const areContentsPublished = service.areContentsPublished(contentGroup);
    expect(areContentsPublished).toBe(false);
  });

  it('should detect that only one content is published if one content is published', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 1;
    contentGroup.lastPublishedIndex = 1;
    const isSinglePublished = service.isSingleContentPublished(contentGroup);
    expect(isSinglePublished).toBe(true);
  });

  it('should detect that not only one content is published if range is published', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 1;
    contentGroup.lastPublishedIndex = 3;
    const isSinglePublished = service.isSingleContentPublished(contentGroup);
    expect(isSinglePublished).toBe(false);
  });

  it('should detect that not only one content is published if all contents are published initially', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 0;
    contentGroup.lastPublishedIndex = -1;
    const isSinglePublished = service.isSingleContentPublished(contentGroup);
    expect(isSinglePublished).toBe(false);
  });

  it('should detect that content is first published in range if content is first and all contents are published initially', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 0;
    contentGroup.lastPublishedIndex = -1;
    const isFirstPublished = service.isFirstPublished(contentGroup, 0);
    expect(isFirstPublished).toBe(true);
  });

  it('should detect that content is first published in range if content is first and range published', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 1;
    contentGroup.lastPublishedIndex = 3;
    const isFirstPublished = service.isFirstPublished(contentGroup, 1);
    expect(isFirstPublished).toBe(true);
  });

  it('should detect that content is not first published in range if content is not first and all contents are published initially', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 0;
    contentGroup.lastPublishedIndex = -1;
    const isFirstPublished = service.isFirstPublished(contentGroup, 1);
    expect(isFirstPublished).toBe(false);
  });

  it('should detect that content is last published in range if content is last and all contents are published initially', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 0;
    contentGroup.lastPublishedIndex = -1;
    const isLastPublished = service.isLastPublished(contentGroup, 4);
    expect(isLastPublished).toBe(true);
  });

  it('should detect that content is last published in range if content is last and range published', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 1;
    contentGroup.lastPublishedIndex = 3;
    const isLastPublished = service.isLastPublished(contentGroup, 3);
    expect(isLastPublished).toBe(true);
  });

  it('should detect that content is not last published in range if content is not last and all contents are published initially', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 0;
    contentGroup.lastPublishedIndex = -1;
    const isLastPublished = service.isLastPublished(contentGroup, 3);
    expect(isLastPublished).toBe(false);
  });

  it('should detect that content is not last published in range if content is not last and all contents are published', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 0;
    contentGroup.lastPublishedIndex = 4;
    const isLastPublished = service.isLastPublished(contentGroup, 3);
    expect(isLastPublished).toBe(false);
  });

  it('should detect that content is before published range if content is before range published', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 1;
    contentGroup.lastPublishedIndex = 3;
    const isDirectlyBeforeRange = service.isBeforeRange(contentGroup, 0);
    expect(isDirectlyBeforeRange).toBe(true);
  });

  it('should not detect that content is before published range if content is in published range', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 1;
    contentGroup.lastPublishedIndex = 3;
    const isDirectlyBeforeRange = service.isBeforeRange(contentGroup, 2);
    expect(isDirectlyBeforeRange).toBe(false);
  });

  it('should detect that content is directly after published range if content is after range published', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 1;
    contentGroup.lastPublishedIndex = 3;
    const isDirectlyAfterRange = service.isDirectlyAfterRange(contentGroup, 4);
    expect(isDirectlyAfterRange).toBe(true);
  });

  it('should not detect that content is directly after published range if content is in published range', () => {
    const contentGroup = new ContentGroup();
    contentGroup.contentIds = ['0', '1', '2', '3', '4'];
    contentGroup.firstPublishedIndex = 1;
    contentGroup.lastPublishedIndex = 3;
    const isDirectlyAfterRange = service.isDirectlyAfterRange(contentGroup, 2);
    expect(isDirectlyAfterRange).toBe(false);
  });
});
