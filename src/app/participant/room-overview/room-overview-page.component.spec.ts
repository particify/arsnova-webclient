import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RoomOverviewPageComponent } from './room-overview-page.component';
import { Router } from '@angular/router';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import {
  MockGlobalStorageService,
  MockRouter,
  MockEventService,
  MockFeatureFlagService,
  MockNotificationService,
} from '@testing/test-helpers';
import { of } from 'rxjs';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { EventService } from '@app/core/services/util/event.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { Room } from '@app/core/models/room';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { CommentService } from '@app/core/services/http/comment.service';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { Message } from '@stomp/stompjs';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { RoomStats } from '@app/core/models/room-stats';
import { ContentGroup, GroupType } from '@app/core/models/content-group';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { CommentSettings } from '@app/core/models/comment-settings';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ApiConfig } from '@app/core/models/api-config';

describe('RoomOverviewPageComponent', () => {
  let component: RoomOverviewPageComponent;
  let fixture: ComponentFixture<RoomOverviewPageComponent>;

  const mockRoomStatsService = jasmine.createSpyObj(['getStats']);
  mockRoomStatsService.getStats.and.returnValue(of({}));

  const mockWsCommentService = jasmine.createSpyObj(['getCommentStream']);
  const message = {
    body: '{ "payload": {} }',
  };
  mockWsCommentService.getCommentStream.and.returnValue(of(message));

  const mockCommentService = jasmine.createSpyObj(['countByRoomId']);
  mockCommentService.countByRoomId.and.returnValue(of({}));

  const mockFeedbackService = jasmine.createSpyObj(['startSub']);
  mockFeedbackService.messageEvent = new EventEmitter<Message>();

  const mockContentGroupService = jasmine.createSpyObj([
    'getByRoomIdAndName',
    'getById',
    'getByIds',
    'filterPublishedIds',
    'sortContentGroupsByName',
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
  mockContentGroupService.filterPublishedIds.and.returnValue([]);
  mockContentGroupService.sortContentGroupsByName.and.returnValue([
    new ContentGroup('roomId', 'name', [], true),
  ]);

  const mockCommentSettingsService = jasmine.createSpyObj([
    'getSettingsStream',
  ]);

  mockCommentSettingsService.getSettingsStream.and.returnValue(of({}));

  const mockFocusModeService = jasmine.createSpyObj(['getFocusModeEnabled']);
  mockFocusModeService.getFocusModeEnabled.and.returnValue(of(true));

  const mockHotkeyService = jasmine.createSpyObj([
    'registerHotkey',
    'unregisterHotkey',
  ]);

  const formattingService = jasmine.createSpyObj(['postString']);
  formattingService.postString.and.returnValue(of('rendered'));

  const mockRoutingService = jasmine.createSpyObj('RoutingService', [
    'getRoomJoinUrl',
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule(), RoomOverviewPageComponent],
      providers: [
        {
          provide: RoomStatsService,
          useValue: mockRoomStatsService,
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
          provide: FeedbackService,
          useValue: mockFeedbackService,
        },
        {
          provide: ContentGroupService,
          useValue: mockContentGroupService,
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
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: CommentSettingsService,
          useValue: mockCommentSettingsService,
        },
        {
          provide: ContentPublishService,
          useClass: ContentPublishService,
        },
        {
          provide: FocusModeService,
          useValue: mockFocusModeService,
        },
        {
          provide: FeatureFlagService,
          useClass: MockFeatureFlagService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: HotkeyService,
          useValue: mockHotkeyService,
        },
        {
          provide: FormattingService,
          useValue: formattingService,
        },
        {
          provide: RoutingService,
          useValue: mockRoutingService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomOverviewPageComponent);
    component = fixture.componentInstance;
    component.room = new Room();
    component.room.settings = { feedbackLocked: true };
    component.commentSettings = new CommentSettings();
    component.apiConfig = new ApiConfig([], {}, {});
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

  it('should initialize feedback status', () => {
    const getFeedbackSpy = spyOn(component, 'getFeedback');
    fixture.detectChanges();
    expect(getFeedbackSpy).toHaveBeenCalled();
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
