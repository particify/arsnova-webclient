import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsPageComponent } from './comments-page.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  ActivatedRouteStub,
  JsonTranslationLoader,
  MockAnnounceService,
  MockEventService,
  MockGlobalStorageService,
  MockMatDialog,
  MockNotificationService,
} from '@testing/test-helpers';
import { CommentService } from '@app/core/services/http/comment.service';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { VoteService } from '@app/core/services/http/vote.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { EventService } from '@app/core/services/util/event.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { Location } from '@angular/common';
import { Room } from '@app/core/models/room';
import { RouterTestingModule } from '@angular/router/testing';
import { SpyLocation } from '@angular/common/testing';
import { of } from 'rxjs';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { CommentFocusState } from '@app/core/models/events/remote/comment-focus-state';

describe('CommentsPageComponent', () => {
  let component: CommentsPageComponent;
  let fixture: ComponentFixture<CommentsPageComponent>;

  const mockAuthenticationService = jasmine.createSpyObj([
    'getCurrentAuthentication',
  ]);
  const auth = {
    userId: 'user1234',
  };
  mockAuthenticationService.getCurrentAuthentication.and.returnValue(of(auth));

  const mockWsCommentService = jasmine.createSpyObj([
    'getCommentStream',
    'getCommentSettingsStream',
  ]);
  const message = {
    body: '{ "payload": {} }',
  };
  mockWsCommentService.getCommentStream.and.returnValue(of(message));
  mockWsCommentService.getCommentSettingsStream.and.returnValue(of(message));

  const mockCommentService = jasmine.createSpyObj([
    'getAckComments',
    'countByRoomId',
  ]);
  mockCommentService.countByRoomId.and.returnValue(of({}));
  mockCommentService.getAckComments.and.returnValue(of([]));

  const mockVoteService = jasmine.createSpyObj(['getByRoomIdAndUserID']);
  mockVoteService.getByRoomIdAndUserID.and.returnValue(of({}));

  const mockCommentSettingsService = jasmine.createSpyObj(['get']);
  mockCommentSettingsService.get.and.returnValue(of({}));

  const room = new Room();
  const data = {
    room: room,
  };
  const activatedRouteStub = new ActivatedRouteStub(undefined, data);

  const mockFocusModeService = jasmine.createSpyObj([
    'getFocusModeEnabled',
    'getCommentState',
  ]);
  mockFocusModeService.getFocusModeEnabled.and.returnValue(of(true));
  mockFocusModeService.getCommentState.and.returnValue(
    of(new CommentFocusState('commentId'))
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommentsPageComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
        BrowserAnimationsModule,
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
          provide: MatDialog,
          useValue: MockMatDialog,
        },
        {
          provide: Router,
          useClass: RouterTestingModule,
        },
        {
          provide: Location,
          useClass: SpyLocation,
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
        {
          provide: FocusModeService,
          useValue: mockFocusModeService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
