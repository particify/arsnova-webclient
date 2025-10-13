import { ComponentFixture, waitForAsync } from '@angular/core/testing';

import { RoomOverviewPageComponent } from './room-overview-page.component';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { MockRouter } from '@testing/test-helpers';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { Router } from '@angular/router';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { of } from 'rxjs';
import { ContentGroup, GroupType } from '@app/core/models/content-group';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { SplitShortIdPipe } from '@app/core/pipes/split-short-id.pipe';
import { RoomStats } from '@app/core/models/room-stats';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentType } from '@app/core/models/content-type.enum';
import { configureTestModule } from '@testing/test.setup';
import { RoomService } from '@app/core/services/http/room.service';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { UserRole } from '@app/core/models/user-roles.enum';
import { Room } from '@app/core/models/room';

describe('RoomOverviewPageComponent', () => {
  let component: RoomOverviewPageComponent;
  let fixture: ComponentFixture<RoomOverviewPageComponent>;

  const mockRoomStatsService = jasmine.createSpyObj('RoomStatsService', [
    'getStats',
  ]);
  mockRoomStatsService.getStats.and.returnValue(of({}));

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

  const mockContentService = jasmine.createSpyObj(ContentService, [
    'getTypeIcons',
  ]);
  mockContentService.getTypeIcons.and.returnValue(
    new Map<ContentType, string>()
  );

  const mockRoomService = jasmine.createSpyObj(['changeFeedbackLock']);

  const mockFeedbackService = jasmine.createSpyObj([
    'get',
    'startSub',
    'getMessages',
  ]);
  mockFeedbackService.get.and.returnValue(of([0, 0, 0, 0]));
  mockFeedbackService.getMessages.and.returnValue(of());

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
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: ContentService,
          useValue: mockContentService,
        },
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
        {
          provide: FeedbackService,
          useValue: mockFeedbackService,
        },
        {
          provide: RoomSettingsService,
          useClass: MockRoomSettingsService,
        },
        ContentPublishService,
      ]
    );
    testBed.compileComponents();
    fixture = testBed.createComponent(RoomOverviewPageComponent);
    fixture.componentRef.setInput('room', new Room());
    fixture.componentRef.setInput('roomId', '1234');
    fixture.componentRef.setInput('shortId', '12345678');
    fixture.componentRef.setInput('userRole', UserRole.EDITOR);
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
