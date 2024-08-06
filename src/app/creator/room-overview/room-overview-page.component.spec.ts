import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RoomOverviewPageComponent } from './room-overview-page.component';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  MockEventService,
  MockGlobalStorageService,
  MockNotificationService,
  MockRouter,
} from '@testing/test-helpers';
import { EventService } from '@app/core/services/util/event.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { Router } from '@angular/router';
import { DialogService } from '@app/core/services/util/dialog.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ContentGroup, GroupType } from '@app/core/models/content-group';
import { Room } from '@app/core/models/room';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { CommentService } from '@app/core/services/http/comment.service';
import { SplitShortIdPipe } from '@app/core/pipes/split-short-id.pipe';
import { RoutingService } from '@app/core/services/util/routing.service';
import { RoomStats } from '@app/core/models/room-stats';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentType } from '@app/core/models/content-type.enum';

class MockRoutingService {}

describe('RoomOverviewPageComponent', () => {
  let component: RoomOverviewPageComponent;
  let fixture: ComponentFixture<RoomOverviewPageComponent>;

  const mockRoomStatsService = jasmine.createSpyObj('RoomStatsService', [
    'getStats',
  ]);
  mockRoomStatsService.getStats.and.returnValue(of({}));

  const mockWsCommentService = jasmine.createSpyObj('WsCommentService', [
    'getCommentStream',
  ]);
  const message = {
    body: '{ "payload": {} }',
  };
  mockWsCommentService.getCommentStream.and.returnValue(of(message));

  const mockCommentService = jasmine.createSpyObj(['countByRoomId']);
  mockCommentService.countByRoomId.and.returnValue(of({}));

  const mockContentGroupService = jasmine.createSpyObj('ContentGroupService', [
    'getByRoomIdAndName',
    'getById',
    'getByIds',
    'isIndexPublished',
    'sortContentGroupsByName',
    'getTypeIcons',
  ]);
  mockContentGroupService.getByRoomIdAndName.and.returnValue(
    of(new ContentGroup('roomId', 'name', [], true))
  );
  mockContentGroupService.getById.and.returnValue(
    of(new ContentGroup('roomId', 'name', [], true))
  );
  mockContentGroupService.getByIds.and.returnValue(
    of([new ContentGroup('roomId', 'name', [], true)])
  );
  mockContentGroupService.isIndexPublished.and.returnValue(true);
  mockContentGroupService.sortContentGroupsByName.and.returnValue([
    new ContentGroup('roomId', 'name', [], true),
  ]);
  mockContentGroupService.getTypeIcons.and.returnValue(
    new Map<GroupType, string>()
  );

  const mockDialogService = jasmine.createSpyObj('DialogService', [
    'openContentGroupCreationDialog',
  ]);

  const mockContentService = jasmine.createSpyObj(ContentService, [
    'getTypeIcons',
  ]);
  mockContentService.getTypeIcons.and.returnValue(
    new Map<ContentType, string>()
  );

  const mockRoutingService = jasmine.createSpyObj('RoutingService', [
    'getRoomJoinUrl',
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        RoomOverviewPageComponent,
        A11yIntroPipe,
        SplitShortIdPipe,
      ],
      providers: [
        {
          provide: RoomStatsService,
          useValue: mockRoomStatsService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: EventService,
          useClass: MockEventService,
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
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: WsCommentService,
          useValue: mockWsCommentService,
        },
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
        {
          provide: ContentService,
          useValue: mockContentService,
        },
        {
          provide: RoutingService,
          useValue: mockRoutingService,
        },
      ],
      imports: [getTranslocoModule()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomOverviewPageComponent);
    component = fixture.componentInstance;
    component.room = new Room();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize stats', () => {
    const initializeStatsSpy = spyOn(component, 'initializeStats');
    fixture.detectChanges();
    expect(initializeStatsSpy).toHaveBeenCalled();
  });

  it('should load content groups if there are group stats in room stats', () => {
    const groupStats = [
      {
        id: 'groupId',
        groupName: 'groupName',
        contentCount: 5,
        groupType: GroupType.MIXED,
      },
    ];
    const roomStats = new RoomStats(groupStats, 0, 0, 0, 0);
    mockRoomStatsService.getStats.and.returnValue(of(roomStats));
    fixture.detectChanges();
    expect(mockContentGroupService.getByIds).toHaveBeenCalled();
  });

  it('should call afterGroupsLoadHook if content groups exist', () => {
    const afterGroupsLoadHookSpy = spyOn(component, 'afterGroupsLoadHook');
    const groupStats = [
      {
        id: 'groupId',
        groupName: 'groupName',
        contentCount: 5,
        groupType: GroupType.MIXED,
      },
    ];
    const roomStats = new RoomStats(groupStats, 0, 0, 0, 0);
    mockRoomStatsService.getStats.and.returnValue(of(roomStats));
    fixture.detectChanges();
    expect(afterGroupsLoadHookSpy).toHaveBeenCalled();
  });

  it('should call afterGroupsLoadHook also if no content groups exist', () => {
    const afterGroupsLoadHookSpy = spyOn(component, 'afterGroupsLoadHook');
    const roomStats = new RoomStats([], 0, 0, 0, 0);
    mockRoomStatsService.getStats.and.returnValue(of(roomStats));
    fixture.detectChanges();
    expect(afterGroupsLoadHookSpy).toHaveBeenCalled();
  });

  it('should subscribe to comment counter', () => {
    fixture.detectChanges();
    expect(mockCommentService.countByRoomId).toHaveBeenCalled();
    expect(mockWsCommentService.getCommentStream).toHaveBeenCalled();
  });

  it('should prepare attachment data', () => {
    const prepareAttachmentDataSpy = spyOn(component, 'prepareAttachmentData');
    fixture.detectChanges();
    expect(prepareAttachmentDataSpy).toHaveBeenCalled();
  });
});
