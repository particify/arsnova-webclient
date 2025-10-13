import { ComponentFixture, waitForAsync } from '@angular/core/testing';
import { RoomOverviewPageComponent } from './room-overview-page.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { MockFeatureFlagService } from '@testing/test-helpers';
import { of } from 'rxjs';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { RoomStats } from '@app/core/models/room-stats';
import { ContentGroup, GroupType } from '@app/core/models/content-group';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { configureTestModule } from '@testing/test.setup';
import { RoomService } from '@app/core/services/http/room.service';
import { SplitShortIdPipe } from '@app/core/pipes/split-short-id.pipe';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { UserRole } from '@app/core/models/user-roles.enum';

describe('RoomOverviewPageComponent', () => {
  let component: RoomOverviewPageComponent;
  let fixture: ComponentFixture<RoomOverviewPageComponent>;

  const mockRoomStatsService = jasmine.createSpyObj(['getStats']);
  mockRoomStatsService.getStats.and.returnValue(of({}));

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

  const mockFocusModeService = jasmine.createSpyObj(['getFocusModeEnabled']);
  mockFocusModeService.getFocusModeEnabled.and.returnValue(of(true));

  const mockFeedbackService = jasmine.createSpyObj(['startSub', 'getMessages']);
  mockFeedbackService.getMessages.and.returnValue(of());

  const mockWsCommentService = jasmine.createSpyObj(['getCommentStream']);
  mockWsCommentService.getCommentStream.and.returnValue(of({}));

  const mockRoomService = jasmine.createSpyObj(['changeFeedbackLock']);

  class MockRoomSettingsService {
    getByRoomId() {
      return of({
        surveyEnabled: true,
        surveyType: LiveFeedbackType.FEEDBACK,
        commentThresholdEnabled: false,
      });
    }
  }

  beforeEach(waitForAsync(() => {
    const testBed = configureTestModule(
      [
        getTranslocoModule(),
        RoomOverviewPageComponent,
        A11yIntroPipe,
        SplitShortIdPipe,
      ],
      [
        {
          provide: RoomStatsService,
          useValue: mockRoomStatsService,
        },
        {
          provide: ContentGroupService,
          useValue: mockContentGroupService,
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
          provide: FeedbackService,
          useValue: mockFeedbackService,
        },
        {
          provide: WsCommentService,
          useValue: mockWsCommentService,
        },
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
        {
          provide: RoomSettingsService,
          useClass: MockRoomSettingsService,
        },
      ]
    );
    testBed.compileComponents();
    fixture = testBed.createComponent(RoomOverviewPageComponent);
    fixture.componentRef.setInput('roomId', 'roomId');
    fixture.componentRef.setInput('shortId', '12345678');
    fixture.componentRef.setInput('viewRole', UserRole.PARTICIPANT);
    component = fixture.componentInstance;
  }));

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
        published: false,
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
        published: false,
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
});
