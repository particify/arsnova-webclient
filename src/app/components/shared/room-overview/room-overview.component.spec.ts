import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RoomOverviewComponent } from './room-overview.component';
import { ActivatedRoute } from '@angular/router';
import {
  MockGlobalStorageService,
  MockEventService,
  ActivatedRouteStub,
  JsonTranslationLoader
} from '@arsnova/testing/test-helpers';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { ContentGroupService } from '@arsnova/app/services/http/content-group.service';
import { RoomStatsService } from '@arsnova/app/services/http/room-stats.service';
import { WsCommentService } from '@arsnova/app/services/websockets/ws-comment.service';
import { CommentService } from '@arsnova/app/services/http/comment.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RoomOverviewComponent', () => {
  let component: RoomOverviewComponent;
  let fixture: ComponentFixture<RoomOverviewComponent>;

  const mockRoomStatsService = jasmine.createSpyObj(['getStats']);

  const mockWsCommentService = jasmine.createSpyObj(['getCommentStream']);

  const mockCommentService = jasmine.createSpyObj(['countByRoomId']);

  const mockContentGroupService = jasmine.createSpyObj(['getById']);

  const activatedRouteStub = new ActivatedRouteStub();


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomOverviewComponent ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        })
      ],
      providers: [
        {
          provide: RoomStatsService,
          useValue: mockRoomStatsService
        },
        {
          provide: WsCommentService,
          useValue: mockWsCommentService
        },
        {
          provide: CommentService,
          useValue: mockCommentService
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
          provide: EventService,
          useClass: MockEventService
        }
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
