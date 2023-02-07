import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NavBarComponent } from './nav-bar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  MockGlobalStorageService,
  MockLangService,
} from '@arsnova/testing/test-helpers';
import { of } from 'rxjs';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { ContentGroupService } from '@arsnova/app/services/http/content-group.service';
import { Room } from '@arsnova/app/models/room';
import { NO_ERRORS_SCHEMA, EventEmitter, Injectable } from '@angular/core';
import { FeedbackService } from '@arsnova/app/services/http/feedback.service';
import { Message } from '@stomp/stompjs';
import { RoutingService } from '@arsnova/app/services/util/routing.service';
import { RoomStatsService } from '@arsnova/app/services/http/room-stats.service';
import { ContentGroup } from '@arsnova/app/models/content-group';
import { MatMenuModule } from '@angular/material/menu';
import { RoomService } from '@arsnova/app/services/http/room.service';
import { MatButtonHarness } from '@angular/material/button/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { UserRole } from '@arsnova/app/models/user-roles.enum';
import { RouterTestingModule } from '@angular/router/testing';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import {
  MatMenuHarness,
  MatMenuItemHarness,
} from '@angular/material/menu/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { FeedbackMessageType } from '@arsnova/app/models/messages/feedback-message-type';
import { CommentSettingsService } from '@arsnova/app/services/http/comment-settings.service';

@Injectable()
class MockContentGroupService {
  getById(id) {
    return of(new ContentGroup(id, 'rev', 'roomId', 'Test'));
  }

  sortContentGroupsByName(groups) {
    return groups;
  }
}

describe('NavBarComponent', () => {
  let component: NavBarComponent;
  let fixture: ComponentFixture<NavBarComponent>;
  let route: ActivatedRoute;
  let router: Router;
  let eventService: EventService;

  const mockRoomStatsService = jasmine.createSpyObj(['getStats']);
  mockRoomStatsService.getStats.and.returnValue(of({}));

  const mockFeedbackService = jasmine.createSpyObj(['startSub']);
  mockFeedbackService.messageEvent = new EventEmitter<Message>();

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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NavBarComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatMenuModule,
        RouterTestingModule.withRoutes([]),
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
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
        {
          provide: CommentSettingsService,
          useValue: mockCommentSettingsService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    viewport.set('desktop');
    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    route = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(Router);
    eventService = TestBed.inject(EventService);
  });

  it('should create', () => {
    const room = new Room();
    room.settings = {
      feedbackLocked: false,
    };
    const data = {
      room: room,
    };
    route.data = of(data);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have navigation buttons for room overview and comments', async () => {
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    const data = {
      room: room,
      viewRole: UserRole.PARTICIPANT,
    };
    route.data = of(data);
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
    const data = {
      room: room,
      userRole: UserRole.PARTICIPANT,
      viewRole: UserRole.PARTICIPANT,
    };
    route.data = of(data);
    fixture.detectChanges();
    const feedbackButtonElement =
      fixture.nativeElement.querySelector('#feedback-button');
    expect(feedbackButtonElement).toBeNull('Feedback button should be null.');
  });

  it('should HAVE navigation button for feedback if locked in role CREATOR', async () => {
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    const data = {
      room: room,
      userRole: UserRole.CREATOR,
      viewRole: UserRole.CREATOR,
    };
    route.data = of(data);
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
    const data = {
      room: room,
      userRole: UserRole.CREATOR,
      viewRole: UserRole.CREATOR,
    };
    route.data = of(data);
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
    const data = {
      room: room,
      viewRole: UserRole.CREATOR,
    };
    route.data = of(data);
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
    const data = {
      room: room,
      viewRole: UserRole.CREATOR,
    };
    route.data = of(data);
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
    route = TestBed.inject(ActivatedRoute);
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    const data = {
      room: room,
      viewRole: UserRole.CREATOR,
    };
    route.data = of(data);
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
    const data = {
      room: room,
      viewRole: UserRole.PARTICIPANT,
    };
    route.data = of(data);
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
    const data = {
      room: room,
      viewRole: UserRole.CREATOR,
    };
    route.data = of(data);
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
    const data = {
      room: room,
      viewRole: UserRole.CREATOR,
    };
    route.data = of(data);
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
    const data = {
      room: room,
      viewRole: UserRole.CREATOR,
    };
    route.data = of(data);
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
    const data = {
      room: room,
      viewRole: UserRole.CREATOR,
    };
    route.data = of(data);
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
    const data = {
      room: room,
      viewRole: UserRole.CREATOR,
    };
    route.data = of(data);
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
    const data = {
      room: room,
      viewRole: UserRole.CREATOR,
    };
    route.data = of(data);
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
    const data = {
      room: room,
      userRole: UserRole.PARTICIPANT,
      viewRole: UserRole.PARTICIPANT,
    };
    route.data = of(data);
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
    const data = {
      room: room,
      userRole: UserRole.PARTICIPANT,
      viewRole: UserRole.PARTICIPANT,
    };
    route.data = of(data);
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
      'id-1111',
      'rev-1111',
      'room-id-1111',
      'Test',
      ['1', '2'],
      true,
      0,
      1
    );
    const changedProperties = ['revision', 'lastPublishedIndex'];
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

  it('should add feedback button for participants when feedback has been started', async () => {
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    const data = {
      room: room,
      userRole: UserRole.PARTICIPANT,
      viewRole: UserRole.PARTICIPANT,
    };
    route.data = of(data);
    fixture.detectChanges();
    let feedbackButtonElement =
      fixture.nativeElement.querySelector('#feedback-button');
    expect(feedbackButtonElement).toBeNull('Feedback button should be null.');
    const body = {
      type: FeedbackMessageType.STARTED,
    };
    const message = {
      body: JSON.stringify(body),
    };
    mockFeedbackService.messageEvent.emit(message);
    fixture.detectChanges();
    feedbackButtonElement =
      fixture.nativeElement.querySelector('#feedback-button');
    expect(feedbackButtonElement).not.toBeNull(
      'Feedback button should be NOT NULL.'
    );
  });

  it('should display news indicator badge for feedback button for participants when feedback has been started', async () => {
    const room = new Room();
    room.settings = {
      feedbackLocked: true,
    };
    room.shortId = '12345678';
    const data = {
      room: room,
      userRole: UserRole.PARTICIPANT,
      viewRole: UserRole.PARTICIPANT,
    };
    route.data = of(data);
    fixture.detectChanges();
    let feedbackBadge = fixture.nativeElement.querySelector('#feedback-badge');
    expect(feedbackBadge).toBeNull();
    const body = {
      type: FeedbackMessageType.STARTED,
    };
    const message = {
      body: JSON.stringify(body),
    };
    mockFeedbackService.messageEvent.emit(message);
    fixture.detectChanges();
    feedbackBadge = fixture.nativeElement.querySelector('#feedback-badge');
    expect(getComputedStyle(feedbackBadge).transform).toBe(badgeVisibleMatrix);
  });

  it('should remove feedback button for participants when feedback has been stopped', async () => {
    const room = new Room();
    room.settings = {
      feedbackLocked: false,
    };
    room.shortId = '12345678';
    const data = {
      room: room,
      userRole: UserRole.PARTICIPANT,
      viewRole: UserRole.PARTICIPANT,
    };
    route.data = of(data);
    fixture.detectChanges();
    let feedbackButtonElement =
      fixture.nativeElement.querySelector('#feedback-button');
    expect(feedbackButtonElement).not.toBeNull(
      'Feedback button should be NOT NULL.'
    );
    const body = {
      type: FeedbackMessageType.STOPPED,
    };
    const message = {
      body: JSON.stringify(body),
    };
    mockFeedbackService.messageEvent.emit(message);
    fixture.detectChanges();
    feedbackButtonElement =
      fixture.nativeElement.querySelector('#feedback-button');
    expect(feedbackButtonElement).toBeNull('Feedback button should be null.');
  });
});
