import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RoomOverviewPageComponent } from './room-overview-page.component';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  ActivatedRouteStub,
  JsonTranslationLoader,
  MockEventService,
  MockGlobalStorageService,
  MockNotificationService,
  MockRouter,
} from '@testing/test-helpers';
import { EventService } from '@app/core/services/util/event.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { DialogService } from '@app/core/services/util/dialog.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ContentGroup } from '@app/core/models/content-group';
import { Room } from '@app/core/models/room';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { CommentService } from '@app/core/services/http/comment.service';
import { SplitShortIdPipe } from '@app/core/pipes/split-short-id.pipe';
import { RoutingService } from '@app/core/services/util/routing.service';

class MockRoutingService {}

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

  const mockContentGroupService = jasmine.createSpyObj([
    'getByRoomIdAndName',
    'isIndexPublished',
  ]);
  mockContentGroupService.getByRoomIdAndName.and.returnValue(
    of(new ContentGroup('1234', '0', 'roomId', 'name', [], true))
  );
  mockContentGroupService.isIndexPublished.and.returnValue(true);

  const mockDialogService = jasmine.createSpyObj('DialogService', [
    'openContentGroupCreationDialog',
  ]);

  const data = {
    room: new Room('1234', 'shortId', 'abbreviation', 'name', 'description'),
  };

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.params = of([{ seriesName: 'SERIES' }]);

  const activatedRouteStub = new ActivatedRouteStub(null, data, snapshot);

  const splitShortIdPipe = new SplitShortIdPipe();

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
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
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
          provide: SplitShortIdPipe,
          useValue: splitShortIdPipe,
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomOverviewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
