import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommentListComponent } from './comment-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '@app/core/services/util/notification.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  MockNotificationService,
  ActivatedRouteStub,
  MockGlobalStorageService,
  MockAnnounceService,
  MockLangService,
  MockMatDialog,
  MockEventService,
  MockRouter,
} from '@testing/test-helpers';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { CommentService } from '@app/core/services/http/comment.service';
import { VoteService } from '@app/core/services/http/vote.service';
import { LanguageService } from '@app/core/services/util/language.service';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule } from '@angular/material/menu';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { EventService } from '@app/core/services/util/event.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { SpyLocation } from '@angular/common/testing';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { Room } from '@app/core/models/room';
import { CounterBracesPipe } from '@app/core/pipes/counter-braces.pipe';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RemoteService } from '@app/core/services/util/remote.service';

describe('CommentListComponent', () => {
  let component: CommentListComponent;
  let fixture: ComponentFixture<CommentListComponent>;

  const mockWsCommentService = jasmine.createSpyObj([
    'getCommentStream',
    'getModeratorCommentStream',
    'getCommentSettingsStream',
  ]);
  const message = {
    body: '{ "payload": {} }',
  };
  mockWsCommentService.getCommentStream.and.returnValue(of(message));
  mockWsCommentService.getModeratorCommentStream.and.returnValue(of(message));
  mockWsCommentService.getCommentSettingsStream.and.returnValue(of(message));

  const mockRoutingService = jasmine.createSpyObj(['getRoleString']);

  const mockCommentService = jasmine.createSpyObj([
    'getAckComments',
    'getRejectedComments',
    'countByRoomId',
    'deleteComments',
    'export',
    'lowlight',
  ]);
  mockCommentService.countByRoomId.and.returnValue(of({}));
  mockCommentService.getAckComments.and.returnValue(of([]));
  mockCommentService.getRejectedComments.and.returnValue(of([]));

  const mockVoteService = jasmine.createSpyObj(['getByRoomIdAndUserID']);
  mockVoteService.getByRoomIdAndUserID.and.returnValue(of({}));

  const mockCommentSettingsService = jasmine.createSpyObj(['get']);
  mockCommentSettingsService.get.and.returnValue(of({}));

  const mockDialogService = jasmine.createSpyObj([
    'openCreateCommentDialog',
    'openDeleteDialog',
  ]);

  const mockHotkeyService = jasmine.createSpyObj([
    'registerHotkey',
    'unregisterHotkey',
  ]);

  const room = new Room();
  const data = {
    room: room,
  };
  const activatedRouteStub = new ActivatedRouteStub(null, data);

  const mockCounterBracesPipe = new CounterBracesPipe();

  const mockRemoteService = jasmine.createSpyObj(['getCommentState']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CommentListComponent, CounterBracesPipe],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
        BrowserAnimationsModule,
        MatMenuModule,
      ],
      providers: [
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
        {
          provide: WsCommentService,
          useValue: mockWsCommentService,
        },
        {
          provide: VoteService,
          useValue: mockVoteService,
        },
        {
          provide: CommentSettingsService,
          useValue: mockCommentSettingsService,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: AnnounceService,
          useClass: MockAnnounceService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: RoutingService,
          useValue: mockRoutingService,
        },
        {
          provide: DialogService,
          useValue: mockDialogService,
        },
        {
          provide: MatDialog,
          useClass: MockMatDialog,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: Location,
          useClass: SpyLocation,
        },
        {
          provide: HotkeyService,
          useValue: mockHotkeyService,
        },
        {
          provide: CounterBracesPipe,
          useValue: mockCounterBracesPipe,
        },
        {
          provide: RemoteService,
          useValue: mockRemoteService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
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
