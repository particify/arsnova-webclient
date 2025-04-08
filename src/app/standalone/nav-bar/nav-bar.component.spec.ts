import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NavBarComponent } from './nav-bar.component';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import {
  ActivatedRouteStub,
  MockGlobalStorageService,
} from '@testing/test-helpers';
import { of } from 'rxjs';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { EventService } from '@app/core/services/util/event.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { Room } from '@app/core/models/room';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { ContentGroup } from '@app/core/models/content-group';
import { MatMenuModule } from '@angular/material/menu';
import { RoomService } from '@app/core/services/http/room.service';
import { MatButtonHarness } from '@angular/material/button/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { UserRole } from '@app/core/models/user-roles.enum';
import { RouterTestingModule } from '@angular/router/testing';
import {
  MatMenuHarness,
  MatMenuItemHarness,
} from '@angular/material/menu/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';

@Injectable()
class MockContentGroupService {
  getById() {
    return of(new ContentGroup('roomId', 'Test'));
  }

  getByIds(ids: string[]) {
    return of(ids.map(() => new ContentGroup('roomId', 'Test')));
  }

  sortContentGroupsByName(groups: ContentGroup[]) {
    return groups;
  }
}

describe('NavBarComponent', () => {
  let component: NavBarComponent;
  let fixture: ComponentFixture<NavBarComponent>;
  let router: Router;
  let eventService: EventService;

  const mockRoomStatsService = jasmine.createSpyObj(['getStats']);
  mockRoomStatsService.getStats.and.returnValue(of({}));

  const mockFeedbackService = jasmine.createSpyObj([
    'startSub',
    'getMessages',
    'emitMessage',
  ]);
  mockFeedbackService.getMessages.and.returnValue(of());

  const body = {
    UserCountChanged: {
      userCount: 42,
    },
  };
  const message = {
    body: JSON.stringify(body),
  };

  const summaries = [
    {
      stats: {
        roomUserCount: 24,
      },
    },
  ];

  const mockRoomService = jasmine.createSpyObj([
    'getCurrentRoomsMessageStream',
    'getRoomSummaries',
  ]);
  mockRoomService.getCurrentRoomsMessageStream.and.returnValue(of(message));
  mockRoomService.getRoomSummaries.and.returnValue(of(summaries));

  const mockCommentSettingsService = jasmine.createSpyObj([
    'getSettingsStream',
  ]);
  mockCommentSettingsService.getSettingsStream.and.returnValue(of({}));

  let loader: HarnessLoader;
  let overviewButton: MatButtonHarness;
  let commentsButton: MatButtonHarness;
  let seriesButton: MatButtonHarness;
  let feedbackButton: MatButtonHarness;
  let seriesMenu: MatMenuHarness;
  let seriesMenuItems: MatMenuItemHarness[];

  const badgeVisibleMatrix = 'matrix(1, 0, 0, 1, 0, 0)';

  const mockFocusModeService = jasmine.createSpyObj('FocusModeService', [
    'init',
    'getState',
    'getFocusModeEnabled',
  ]);

  mockFocusModeService.getState.and.returnValue(of({}));
  mockFocusModeService.getFocusModeEnabled.and.returnValue(of(true));

  const room = new Room();
  room.settings = {
    feedbackLocked: false,
  };
  room.shortId = '12345678';
  const snapshot = new ActivatedRouteSnapshot();
  snapshot.data = {
    room: room,
    userRole: UserRole.EDITOR,
    viewRole: UserRole.PARTICIPANT,
  };

  const activatedRouteStub = new ActivatedRouteStub(
    undefined,
    undefined,
    snapshot
  );
  (activatedRouteStub as { [key: string]: any })['children'] = {};

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        getTranslocoModule(),
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatMenuModule,
        RouterTestingModule.withRoutes([]),
        NavBarComponent,
      ],
      providers: [
        RoutingService,
        EventService,
        {
          provide: RoomStatsService,
          useValue: mockRoomStatsService,
        },
        {
          provide: FeedbackService,
          useValue: mockFeedbackService,
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
        {
          provide: CommentSettingsService,
          useValue: mockCommentSettingsService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    TestBed.overrideProvider(FocusModeService, {
      useValue: mockFocusModeService,
    });
    viewport.set('desktop');
    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    router = TestBed.inject(Router);
    eventService = TestBed.inject(EventService);
  });

  it('should create', () => {
    const room = new Room();
    room.settings = {
      feedbackLocked: false,
    };
    component.room = room;
    component.userRole = UserRole.EDITOR;
    component.viewRole = UserRole.PARTICIPANT;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have navigation buttons for room overview and comments', async () => {
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    component.room = room;
    component.viewRole = UserRole.PARTICIPANT;
    fixture.detectChanges();
    overviewButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#overview-button' })
    );
    commentsButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#comments-button' })
    );
    expect(overviewButton).not.toBeNull();
    expect(commentsButton).not.toBeNull();
  });

  it('should NOT HAVE navigation button for feedback if not enabled and in role PARTICIPANT', async () => {
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    component.room = room;
    component.userRole = UserRole.PARTICIPANT;
    component.viewRole = UserRole.PARTICIPANT;
    fixture.detectChanges();
    const feedbackButtonElement =
      fixture.nativeElement.querySelector('#feedback-button');
    expect(feedbackButtonElement).toBeNull('Feedback button should be null.');
  });

  it('should HAVE navigation button for feedback if locked in role OWNER', async () => {
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    component.room = room;
    component.userRole = UserRole.OWNER;
    component.viewRole = UserRole.OWNER;
    fixture.detectChanges();
    feedbackButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#feedback-button' })
    );
    expect(feedbackButton).not.toBeNull();
  });

  it('should HAVE navigation button for series if existing', async () => {
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    component.room = room;
    component.userRole = UserRole.OWNER;
    component.viewRole = UserRole.OWNER;
    const stats = {
      groupStats: [
        {
          contentCount: 1,
          groupName: 'Test',
          id: 'series-id-1111',
        },
      ],
    };
    mockRoomStatsService.getStats.and.returnValue(of(stats));
    fixture.detectChanges();
    seriesButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#series-button' })
    );
    expect(seriesButton).not.toBeNull();
  });

  it('should HAVE a user counter if desktop device and creator', async () => {
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    component.room = room;
    component.viewRole = UserRole.OWNER;
    fixture.detectChanges();
    const userCounter = fixture.nativeElement.querySelector(
      '#user-count-container'
    );
    expect(getComputedStyle(userCounter).display).not.toBe('none');
  });

  it('should HAVE a user counter if desktop device and creator', async () => {
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    component.room = room;
    component.viewRole = UserRole.OWNER;
    fixture.detectChanges();
    const userCounter = fixture.nativeElement.querySelector(
      '#user-count-container'
    );
    expect(userCounter).not.toBeNull();
    expect(getComputedStyle(userCounter).display).not.toBe('none');
  });

  it('should NOT HAVE a user counter if mobile device', async () => {
    viewport.set('mobile');
    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    component.room = room;
    component.viewRole = UserRole.OWNER;
    fixture.detectChanges();
    const userCounter = fixture.nativeElement.querySelector(
      '#user-count-container'
    );
    expect(getComputedStyle(userCounter).display).toBe('none');
  });

  it('should NOT HAVE a user counter if participant', async () => {
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    component.room = room;
    component.viewRole = UserRole.PARTICIPANT;
    fixture.detectChanges();
    const userCounter = fixture.nativeElement.querySelector(
      '#user-count-container'
    );
    expect(userCounter).toBeNull();
  });

  it('should navigate to room overview when clicking on overview button', async () => {
    spyOn(router, 'navigate').and.stub();
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    component.room = room;
    component.userRole = UserRole.OWNER;
    component.viewRole = UserRole.OWNER;
    fixture.detectChanges();
    overviewButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#overview-button' })
    );
    await overviewButton.click();
    expect(router.navigate).toHaveBeenCalledWith(['edit', '12345678']);
  });

  it('should navigate to comments when clicking on comments button', async () => {
    spyOn(router, 'navigate').and.stub();
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    component.room = room;
    component.userRole = UserRole.OWNER;
    component.viewRole = UserRole.OWNER;
    fixture.detectChanges();
    overviewButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#comments-button' })
    );
    await overviewButton.click();
    expect(router.navigate).toHaveBeenCalledWith([
      'edit',
      '12345678',
      'comments',
    ]);
  });

  it('should navigate to feedback when clicking on feedback button', async () => {
    spyOn(router, 'navigate').and.stub();
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    component.room = room;
    component.userRole = UserRole.OWNER;
    component.viewRole = UserRole.OWNER;
    fixture.detectChanges();
    overviewButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#feedback-button' })
    );
    await overviewButton.click();
    expect(router.navigate).toHaveBeenCalledWith([
      'edit',
      '12345678',
      'feedback',
    ]);
  });

  it('should navigate to series when clicking on series button and there is only one series', async () => {
    spyOn(router, 'navigate').and.stub();
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    component.room = room;
    component.userRole = UserRole.OWNER;
    component.viewRole = UserRole.OWNER;
    const stats = {
      groupStats: [
        {
          contentCount: 1,
          groupName: 'Test',
          id: 'series-id-1111',
        },
      ],
    };
    mockRoomStatsService.getStats.and.returnValue(of(stats));
    fixture.detectChanges();
    overviewButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#series-button' })
    );
    await overviewButton.click();
    expect(router.navigate).toHaveBeenCalledWith([
      'edit',
      '12345678',
      'series',
      component.groupName,
    ]);
  });

  it('should open menu when clicking on series button and there are multiple series', async () => {
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    component.room = room;
    component.userRole = UserRole.OWNER;
    component.viewRole = UserRole.OWNER;
    const stats = {
      groupStats: [
        {
          contentCount: 1,
          groupName: 'Test',
          id: 'series-id-1111',
        },
        {
          contentCount: 1,
          groupName: 'Quiz',
          id: 'series-id-2222',
        },
      ],
    };
    mockRoomStatsService.getStats.and.returnValue(of(stats));
    fixture.detectChanges();
    seriesButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#series-button' })
    );
    await seriesButton.click();
    seriesMenu = await loader.getHarness(
      MatMenuHarness.with({ selector: '#series-button' })
    );
    const isOpen = await seriesMenu.isOpen();
    expect(isOpen).toBe(true, 'Series menu should be open');
  });

  it('should navigate to series when clicking on series menu item', async () => {
    spyOn(router, 'navigate').and.stub();
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    component.room = room;
    component.userRole = UserRole.OWNER;
    component.viewRole = UserRole.OWNER;
    const stats = {
      groupStats: [
        {
          contentCount: 1,
          groupName: 'Test',
          id: 'id-1',
        },
        {
          contentCount: 1,
          groupName: 'Quiz',
          id: 'id-2',
        },
      ],
    };
    mockRoomStatsService.getStats.and.returnValue(of(stats));
    fixture.detectChanges();
    seriesButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#series-button' })
    );
    await seriesButton.click();
    seriesMenu = await loader.getHarness(
      MatMenuHarness.with({ selector: '#series-button' })
    );
    seriesMenuItems = await seriesMenu.getItems({
      selector: '#Test-series-button',
    });
    await seriesMenuItems[0].click();
    expect(router.navigate).toHaveBeenCalledWith([
      'edit',
      '12345678',
      'series',
      'Test',
    ]);
  });

  it('should display news indicator badge for series button for participants when series has been published', async () => {
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    component.room = room;
    component.userRole = UserRole.PARTICIPANT;
    component.viewRole = UserRole.PARTICIPANT;
    const stats = {
      groupStats: [
        {
          contentCount: 2,
          groupName: 'Test',
          id: 'id-1111',
        },
      ],
    };
    mockRoomStatsService.getStats.and.returnValue(of(stats));
    const newStats = {
      groupStats: [
        {
          contentCount: 1,
          groupName: 'Test',
          id: 'series-id-1111',
        },
        {
          contentCount: 1,
          groupName: 'Quiz',
          id: 'series-id-2222',
        },
      ],
    };
    const statsEvent = {
      payload: {
        data: newStats,
      },
    };
    fixture.detectChanges();
    eventService.broadcast('PublicDataChanged', statsEvent);
    fixture.detectChanges();
    const seriesBadge = fixture.nativeElement.querySelector('#series-badge');
    expect(getComputedStyle(seriesBadge).transform).toBe(badgeVisibleMatrix);
  });

  it('should display news indicator badge for series button for participants when series has new published contents', async () => {
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    component.room = room;
    component.userRole = UserRole.PARTICIPANT;
    component.viewRole = UserRole.PARTICIPANT;
    const stats = {
      groupStats: [
        {
          contentCount: 2,
          groupName: 'Test',
          id: 'id-1111',
        },
      ],
    };
    mockRoomStatsService.getStats.and.returnValue(of(stats));
    fixture.detectChanges();
    const entity = new ContentGroup(
      'room-id-1111',
      'Test',
      ['1', '2'],
      true,
      true,
      true
    );
    const changedProperties = ['revision', 'publishingIndex'];
    const changes = {
      entityType: 'ContentGroup',
      entity: entity,
      changedProperties: changedProperties,
    };
    eventService.broadcast('EntityChanged', changes);
    fixture.detectChanges();
    const seriesBadge = fixture.nativeElement.querySelector('#series-badge');
    expect(getComputedStyle(seriesBadge).transform).toBe(badgeVisibleMatrix);
  });
});
