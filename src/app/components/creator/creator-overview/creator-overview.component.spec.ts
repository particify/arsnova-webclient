import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreatorOverviewComponent } from './creator-overview.component';
import { ContentService } from '@arsnova/app/services/http/content.service';
import { RoomStatsService } from '@arsnova/app/services/http/room-stats.service';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import {
  ActivatedRouteStub,
  JsonTranslationLoader,
  MockGlobalStorageService,
  MockLangService,
  MockMatDialog,
  MockNotificationService,
  MockRouter,
} from '@arsnova/testing/test-helpers';
import { EventService } from '@arsnova/app/services/util/event.service';
import { RoomService } from '@arsnova/app/services/http/room.service';
import { ContentGroupService } from '@arsnova/app/services/http/content-group.service';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { DialogService } from '@arsnova/app/services/util/dialog.service';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { Location } from '@angular/common';
import { MockLocationStrategy } from '@angular/common/testing';
import { A11yIntroPipe } from '@arsnova/app/pipes/a11y-intro.pipe';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Content } from '@arsnova/app/models/content';
import { ContentType } from '@arsnova/app/models/content-type.enum';
import { ContentState } from '@arsnova/app/models/content-state';
import { ContentGroup } from '@arsnova/app/models/content-group';
import { Room } from '@arsnova/app/models/room';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { WsCommentService } from '@arsnova/app/services/websockets/ws-comment.service';
import { CommentService } from '@arsnova/app/services/http/comment.service';
import { SplitShortIdPipe } from '@arsnova/app/pipes/split-short-id.pipe';
import { MatMenuModule } from '@angular/material/menu';
import {
  RoomSummary,
  RoomSummaryStats,
} from '@arsnova/app/models/room-summary';
import { RoutingService } from '@arsnova/app/services/util/routing.service';

@Injectable()
class MockContentService {
  getContentsByIds() {
    return of([
      new Content(
        '1234',
        '0',
        '1',
        'subject',
        'body',
        [],
        ContentType.CHOICE,
        {},
        new ContentState(1, new Date(), true)
      ),
    ]);
  }
}

@Injectable()
class MockEventService {
  on() {
    return of('1234');
  }
}

@Injectable()
class MockRoomService {
  getCurrentRoomsMessageStream() {
    return of({ body: '{ "UserCountChanged": { "userCount": 0} }' });
  }

  getRoomSummaries() {
    const summary = new RoomSummary();
    summary.stats = new RoomSummaryStats();
    summary.stats.roomUserCount = 0;
    return of([summary]);
  }
}

@Injectable()
class MockContentGroupService {
  getByRoomIdAndName() {
    return of(new ContentGroup('1234', '0', 'roomId', 'name', [], true));
  }
  isIndexPublished() {
    return true;
  }
}
@Injectable()
class MockRoomStatsService {
  getStats() {
    return of({});
  }
}

@Injectable()
class MockDialogService {}
@Injectable()
class MockWsCommentService {
  getCommentStream() {
    const body = '{ "payload": {} }';
    return of({ body: body });
  }
}

@Injectable()
class MockCommentService {
  countByRoomId() {
    return of(0);
  }
}

class MockRoutingService {}

describe('CreatorOverviewComponent', () => {
  let component: CreatorOverviewComponent;
  let fixture: ComponentFixture<CreatorOverviewComponent>;

  const data = {
    room: new Room('1234', 'shortId', 'abbreviation', 'name', 'description'),
  };

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.params = of([{ seriesName: 'SERIES' }]);

  const activatedRouteStub = new ActivatedRouteStub(null, data, snapshot);

  let translateService: TranslateService;

  const a11yIntroPipe = new A11yIntroPipe(translateService);

  const splitShortIdPipe = new SplitShortIdPipe();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CreatorOverviewComponent, A11yIntroPipe, SplitShortIdPipe],
      providers: [
        {
          provide: ContentService,
          useClass: MockContentService,
        },
        {
          provide: RoomStatsService,
          useClass: MockRoomStatsService,
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
          provide: RoomService,
          useClass: MockRoomService,
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: MatDialog,
          useClass: MockMatDialog,
        },
        {
          provide: DialogService,
          useClass: MockDialogService,
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
          provide: Location,
          useClass: MockLocationStrategy,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: A11yIntroPipe,
          useValue: a11yIntroPipe,
        },
        {
          provide: WsCommentService,
          useClass: MockWsCommentService,
        },
        {
          provide: CommentService,
          useClass: MockCommentService,
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
        MatMenuModule,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatorOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
