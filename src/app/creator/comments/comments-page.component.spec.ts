import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsPageComponent } from './comments-page.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import {
  MockAnnounceService,
  MockEventService,
  MockGlobalStorageService,
  MockMatDialog,
  MockNotificationService,
} from '@testing/test-helpers';
import { CommentService } from '@app/core/services/http/comment.service';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { EventService } from '@app/core/services/util/event.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { Router } from '@angular/router';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { Location } from '@angular/common';
import { Room } from '@app/core/models/room';
import { RouterTestingModule } from '@angular/router/testing';
import { SpyLocation } from '@angular/common/testing';
import { of } from 'rxjs';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { CoreModule } from '@app/core/core.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';

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

  const mockCommentSettingsService = jasmine.createSpyObj(['get']);
  mockCommentSettingsService.get.and.returnValue(of({}));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommentsPageComponent],
      imports: [CoreModule, getTranslocoModule(), BrowserAnimationsModule],
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
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: RoutingService,
          useValue: mockRoutingService,
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
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentsPageComponent);
    component = fixture.componentInstance;
    component.room = new Room();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
