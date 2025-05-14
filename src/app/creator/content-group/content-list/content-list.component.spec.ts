import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentListComponent } from './content-list.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import {
  ActivatedRouteStub,
  MockEventService,
  MockGlobalStorageService,
  MockNotificationService,
  MockRouter,
} from '@testing/test-helpers';
import { ContentService } from '@app/core/services/http/content.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from '@app/core/services/util/dialog.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { of } from 'rxjs';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { Content } from '@app/core/models/content';
import { ContentType } from '@app/core/models/content-type.enum';
import {
  ContentGroup,
  GroupType,
  PublishingMode,
} from '@app/core/models/content-group';
import { Room } from '@app/core/models/room';
import { A11yRenderedBodyPipe } from '@app/core/pipes/a11y-rendered-body.pipe';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { ContentState } from '@app/core/models/content-state';
import { EventService } from '@app/core/services/util/event.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { PresentationService } from '@app/core/services/util/presentation.service';

describe('ContentListComponent', () => {
  let component: ContentListComponent;
  let fixture: ComponentFixture<ContentListComponent>;
  const contentState = new ContentState(1, new Date(), true);

  const content1 = new Content();
  content1.id = '0';
  content1.state = contentState;
  const content2 = new Content();
  content2.id = '1';
  content2.state = contentState;
  const content3 = new Content();
  content3.id = '2';
  content3.state = contentState;
  const content4 = new Content();
  content4.id = '3';
  content4.state = contentState;
  const content5 = new Content();
  content5.id = '4';
  content5.state = contentState;
  const content6 = new Content();
  content6.id = '5';
  content6.state = contentState;

  const mockHotkeyService = jasmine.createSpyObj([
    'registerHotkey',
    'unregisterHotkey',
  ]);

  const mockContentService = jasmine.createSpyObj(ContentService, [
    'getContentsByIds',
    'getTypeIcons',
    'getAnswersDeleted',
    'hasFormatRounds',
  ]);
  mockContentService.getContentsByIds.and.returnValue(of([]));
  mockContentService.getTypeIcons.and.returnValue(
    new Map<ContentType, string>()
  );
  mockContentService.getAnswersDeleted.and.returnValue(of('0'));

  const mockDialogService = jasmine.createSpyObj(DialogService, [
    'openDeleteDialog',
    'openContentGroupCreationDialog',
  ]);

  const mockContentGroupService = jasmine.createSpyObj('ContentGroupService', [
    'getByRoomIdAndName',
    'patchContentGroup',
  ]);

  const contentGroupDefault = new ContentGroup(
    'roomId',
    'DefaultGroupGet',
    ['0', '1', '2', '3', '4', '5'],
    true
  );
  mockContentGroupService.getByRoomIdAndName.and.returnValue(
    of(contentGroupDefault)
  );

  const mockPresentationService = jasmine.createSpyObj('PresentationService', [
    'updateRoundState',
  ]);

  const activatedRouteStub = new ActivatedRouteStub();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentListComponent, A11yIntroPipe, A11yRenderedBodyPipe],
      providers: [
        {
          provide: ContentService,
          useValue: mockContentService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: ContentGroupService,
          useValue: mockContentGroupService,
        },
        {
          provide: DialogService,
          useValue: mockDialogService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: HotkeyService,
          useValue: mockHotkeyService,
        },
        {
          provide: ContentPublishService,
          useClass: ContentPublishService,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: PresentationService,
          useValue: mockPresentationService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
      ],
      imports: [getTranslocoModule(), MatMenuModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(ContentListComponent);
    component = fixture.componentInstance;
    component.room = new Room(
      '1234',
      'shortId',
      'abbreviation',
      'name',
      'description'
    );
    component.isModerator = false;
    component.contentGroupStats = [
      {
        id: 'groupId',
        groupName: 'name',
        contentCount: 0,
        groupType: GroupType.MIXED,
      },
    ];
  }));

  it('should create', () => {
    const contents = [
      content1,
      content2,
      content3,
      content4,
      content5,
      content6,
    ];
    component.contents = contents;
    component.contentGroup = new ContentGroup(
      'roomId',
      'test',
      ['0', '1', '2', '3', '4', '5'],
      true,
      true,
      true
    );
    mockContentGroupService.patchContentGroup.and.returnValue(
      of(component.contentGroup)
    );
    fixture.detectChanges();
  });

  it('should sort contents correctly if content group is locked', () => {
    const contents = [
      content1,
      content2,
      content3,
      content4,
      content5,
      content6,
    ];
    component.contents = contents;
    component.contentGroup = new ContentGroup(
      'roomId',
      'test',
      ['0', '1', '2', '3', '4', '5'],
      true,
      true,
      false
    );
    component.contentGroup.publishingMode = PublishingMode.ALL;
    mockContentGroupService.patchContentGroup.and.returnValue(
      of(component.contentGroup)
    );
    fixture.detectChanges();
    component.dropContent(0, 1);
    expect(component.contents).toEqual(
      [content2, content1, content3, content4, content5, content6],
      'sort content objects correctly'
    );
    let changes: {
      contentIds: string[];
      publishingIndex: number;
    } = {
      contentIds: ['1', '0', '2', '3', '4', '5'],
      publishingIndex: 0,
    };
    expect(mockContentGroupService.patchContentGroup).toHaveBeenCalledWith(
      component.contentGroup,
      changes
    );
    component.dropContent(5, 2);
    expect(component.contents).toEqual(
      [content2, content1, content6, content3, content4, content5],
      'sort content objects correctly'
    );
    changes = {
      contentIds: ['1', '0', '5', '2', '3', '4'],
      publishingIndex: 0,
    };
    expect(mockContentGroupService.patchContentGroup).toHaveBeenCalledWith(
      component.contentGroup,
      changes
    );
  });

  it('should sort contents correctly if content group is fully published', () => {
    const contents = [
      content1,
      content2,
      content3,
      content4,
      content5,
      content6,
    ];
    component.contents = contents;
    component.contentGroup = new ContentGroup(
      'roomId',
      'test',
      ['0', '1', '2', '3', '4', '5'],
      true,
      true,
      true
    );
    component.contentGroup.publishingMode = PublishingMode.ALL;
    mockContentGroupService.patchContentGroup.and.returnValue(
      of(component.contentGroup)
    );
    fixture.detectChanges();
    component.dropContent(0, 2);
    expect(component.contents).toEqual(
      [content2, content3, content1, content4, content5, content6],
      'sort content objects correctly'
    );
    let changes: {
      contentIds: string[];
      publishingIndex: number;
    } = {
      contentIds: ['1', '2', '0', '3', '4', '5'],
      publishingIndex: 0,
    };
    expect(mockContentGroupService.patchContentGroup).toHaveBeenCalledWith(
      component.contentGroup,
      changes
    );
    component.dropContent(5, 2);
    expect(component.contents).toEqual(
      [content2, content3, content6, content1, content4, content5],
      'sort content objects correctly'
    );
    changes = {
      contentIds: ['1', '2', '5', '0', '3', '4'],
      publishingIndex: 0,
    };
    expect(mockContentGroupService.patchContentGroup).toHaveBeenCalledWith(
      component.contentGroup,
      changes
    );
  });

  it('should sort contents correctly if content group has publishing range', () => {
    const contents = [
      content1,
      content2,
      content3,
      content4,
      content5,
      content6,
    ];
    component.contents = contents;
    component.contentGroup = new ContentGroup(
      'roomId',
      'test',
      ['0', '1', '2', '3', '4', '5'],
      true,
      true,
      true
    );
    component.contentGroup.publishingMode = PublishingMode.UP_TO;
    mockContentGroupService.patchContentGroup.and.returnValue(
      of(component.contentGroup)
    );
    fixture.detectChanges();
    component.dropContent(0, 3);
    expect(component.contents).toEqual(
      [content2, content3, content1, content4, content5, content6],
      'sort content objects correctly'
    );
    let changes: {
      contentIds: string[];
      publishingIndex: number;
    } = {
      contentIds: ['1', '2', '0', '3', '4', '5'],
      publishingIndex: 0,
    };
    expect(mockContentGroupService.patchContentGroup).toHaveBeenCalledWith(
      component.contentGroup,
      changes
    );
    component.dropContent(6, 3);
    expect(component.contents).toEqual(
      [content2, content3, content6, content1, content4, content5],
      'sort content objects correctly'
    );
    changes = {
      contentIds: ['1', '2', '5', '0', '3', '4'],
      publishingIndex: 0,
    };
    expect(mockContentGroupService.patchContentGroup).toHaveBeenCalledWith(
      component.contentGroup,
      changes
    );
  });

  it('should sort contents correctly and increase publishing index if content group has publishing range', () => {
    const contents = [
      content1,
      content2,
      content3,
      content4,
      content5,
      content6,
    ];
    component.contents = contents;
    component.contentGroup = new ContentGroup(
      'roomId',
      'test',
      ['0', '1', '2', '3', '4', '5'],
      true,
      true,
      true
    );
    component.contentGroup.publishingMode = PublishingMode.UP_TO;
    mockContentGroupService.patchContentGroup.and.returnValue(
      of(component.contentGroup)
    );
    fixture.detectChanges();
    component.dropContent(2, 1);
    expect(component.contents).toEqual(
      [content1, content2, content3, content4, content5, content6],
      'content order should not change'
    );
    let changes: {
      contentIds: string[];
      publishingIndex: number;
    } = {
      contentIds: ['0', '1', '2', '3', '4', '5'],
      publishingIndex: 1,
    };
    expect(mockContentGroupService.patchContentGroup).toHaveBeenCalledWith(
      component.contentGroup,
      changes
    );
    component.dropContent(5, 1);
    expect(component.contents).toEqual(
      [content1, content5, content2, content3, content4, content6],
      'sort content objects correctly'
    );
    changes = {
      contentIds: ['0', '4', '1', '2', '3', '5'],
      publishingIndex: 2,
    };
    expect(mockContentGroupService.patchContentGroup).toHaveBeenCalledWith(
      component.contentGroup,
      changes
    );
  });

  it('should sort contents correctly and decrease publishing index if content group has publishing range', () => {
    const contents = [
      content1,
      content2,
      content3,
      content4,
      content5,
      content6,
    ];
    component.contents = contents;
    component.contentGroup = new ContentGroup(
      'roomId',
      'test',
      ['0', '1', '2', '3', '4', '5'],
      true,
      true,
      true
    );
    component.contentGroup.publishingMode = PublishingMode.UP_TO;
    component.contentGroup.publishingIndex = 2;
    mockContentGroupService.patchContentGroup.and.returnValue(
      of(component.contentGroup)
    );
    fixture.detectChanges();
    component.dropContent(2, 3);
    expect(component.contents).toEqual(
      [content1, content2, content3, content4, content5, content6],
      'content order should not change'
    );
    let changes: {
      contentIds: string[];
      publishingIndex: number;
    } = {
      contentIds: ['0', '1', '2', '3', '4', '5'],
      publishingIndex: 1,
    };
    expect(mockContentGroupService.patchContentGroup).toHaveBeenCalledWith(
      component.contentGroup,
      changes
    );
    component.dropContent(0, 4);
    expect(component.contents).toEqual(
      [content2, content3, content4, content1, content5, content6],
      'sort content objects correctly'
    );
    changes = {
      contentIds: ['1', '2', '3', '0', '4', '5'],
      publishingIndex: 0,
    };
    expect(mockContentGroupService.patchContentGroup).toHaveBeenCalledWith(
      component.contentGroup,
      changes
    );
  });
});
