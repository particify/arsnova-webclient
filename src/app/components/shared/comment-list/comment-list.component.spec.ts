import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommentListComponent } from './comment-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  MockNotificationService,
  ActivatedRouteStub,
  MockGlobalStorageService,
  MockAnnounceService,
  MockLangService,
  MockMatDialog
} from '@arsnova/testing/test-helpers';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { AnnounceService } from '@arsnova/app/services/util/announce.service';
import { RoutingService } from '@arsnova/app/services/util/routing.service';
import { DialogService } from '@arsnova/app/services/util/dialog.service';
import { CommentService } from '@arsnova/app/services/http/comment.service';
import { VoteService } from '@arsnova/app/services/http/vote.service';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule } from '@angular/material/menu';
import { WsCommentService } from '@arsnova/app/services/websockets/ws-comment.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { MockEventService, MockRouter } from '@arsnova/testing/test-helpers';
import { CommentSettingsService } from '@arsnova/app/services/http/comment-settings.service';
import { MockLocationStrategy } from '@angular/common/testing';
import { HotkeyService } from '@arsnova/app/services/util/hotkey.service';
import { Room } from '@arsnova/app/models/room';
import { CounterBracesPipe } from '@arsnova/app/pipes/counter-braces.pipe';
import { of } from 'rxjs';

describe('CommentListComponent', () => {
  let component: CommentListComponent;
  let fixture: ComponentFixture<CommentListComponent>;

  const mockWsCommentService = jasmine.createSpyObj(['getCommentStream', 'getModeratorCommentStream']);
  const message = {
    body: '{ "payload": {} }'
  };
  mockWsCommentService.getCommentStream.and.returnValue(of(message));
  mockWsCommentService.getModeratorCommentStream.and.returnValue(of(message));

  const mockRoutingService = jasmine.createSpyObj(['getRoleString']);

  const mockCommentService = jasmine.createSpyObj(['getAckComments', 'getRejectedComments', 'countByRoomId', 'deleteComments', 'export', 'lowlight']);
  mockCommentService.countByRoomId.and.returnValue(of({}));
  mockCommentService.getAckComments.and.returnValue(of([]));
  mockCommentService.getRejectedComments.and.returnValue(of([]));

  const mockVoteService = jasmine.createSpyObj(['getByRoomIdAndUserID']);
  mockVoteService.getByRoomIdAndUserID.and.returnValue(of({}));

  const mockCommentSettingsService = jasmine.createSpyObj(['get']);
  mockCommentSettingsService.get.and.returnValue(of({}));

  const mockDialogService = jasmine.createSpyObj(['openCreateCommentDialog', 'openDeleteDialog']);

  const mockHotkeyService = jasmine.createSpyObj(['registerHotkey', 'unregisterHotkey']);

  const room = new Room();
  const data = {
    room: room
  }
  const activatedRouteStub = new ActivatedRouteStub(null, data);

  const mockCounterBracesPipe = new CounterBracesPipe();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        CommentListComponent,
        CounterBracesPipe
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        }),
        BrowserAnimationsModule,
        MatMenuModule
      ],
      providers: [
        {
          provide: CommentService,
          useValue: mockCommentService
        },
        {
          provide: WsCommentService,
          useValue: mockWsCommentService
        },
        {
          provide: VoteService,
          useValue: mockVoteService
        },
        {
          provide: CommentSettingsService,
          useValue: mockCommentSettingsService
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: LanguageService,
          useClass: MockLangService
        },
        {
          provide: AnnounceService,
          useClass: MockAnnounceService
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
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
          provide: RoutingService,
          useValue: mockRoutingService
        },
        {
          provide: DialogService,
          useValue: mockDialogService
        },
        {
          provide: MatDialog,
          useClass: MockMatDialog
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: Location,
          useClass: MockLocationStrategy
        },
        {
          provide: HotkeyService,
          useValue: mockHotkeyService
        },
        {
          provide: CounterBracesPipe,
          useValue: mockCounterBracesPipe
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
