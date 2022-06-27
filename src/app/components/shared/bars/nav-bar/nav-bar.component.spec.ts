import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NavBarComponent } from './nav-bar.component';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  ActivatedRouteStub,
  MockGlobalStorageService,
  MockRouter,
  MockEventService,
} from '@arsnova/testing/test-helpers';
import { of } from 'rxjs';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { ContentGroupService } from '@arsnova/app/services/http/content-group.service';
import { Room } from '@arsnova/app/models/room';
import { EventEmitter } from '@angular/core';
import { FeedbackService } from '@arsnova/app/services/http/feedback.service';
import { Message } from '@stomp/stompjs';
import { RoutingService } from '@arsnova/app/services/util/routing.service';
import { RoomStatsService } from '@arsnova/app/services/http/room-stats.service';
import { ContentGroup } from '@arsnova/app/models/content-group';
import { MatMenuModule } from '@angular/material/menu';

describe('NavBarComponent', () => {
  let component: NavBarComponent;
  let fixture: ComponentFixture<NavBarComponent>;

  const mockRoomStatsService = jasmine.createSpyObj(['getStats']);
  mockRoomStatsService.getStats.and.returnValue(of({}));

  const mockFeedbackService = jasmine.createSpyObj(['startSub']);
  mockFeedbackService.messageEvent = new EventEmitter<Message>();

  const mockContentGroupService = jasmine.createSpyObj(['getById']);
  mockContentGroupService.getById.and.returnValue(of(new ContentGroup()));

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.params = {
    seriesName: 'Quiz'
  }

  const room = new Room();
  room.settings = {};
  const data = {
    room: room
  }
  const activatedRouteStub = new ActivatedRouteStub(null, data, snapshot);

  const mockRoutingService = jasmine.createSpyObj(['getRoleString', 'getRouteChanges']);
  mockRoutingService.getRouteChanges.and.returnValue(of(snapshot));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        NavBarComponent
       ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        }),
        MatMenuModule
      ],
      providers: [
        {
          provide: RoomStatsService,
          useValue: mockRoomStatsService
        },
        {
          provide: FeedbackService,
          useValue: mockFeedbackService
        },
        {
          provide: ContentGroupService,
          useValue: mockContentGroupService
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: RoutingService,
          useValue: mockRoutingService
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
