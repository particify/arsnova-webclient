import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommentComponent } from './comment.component';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '@core/services/util/notification.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  MockNotificationService,
  ActivatedRouteStub,
  MockGlobalStorageService,
  MockAnnounceService,
  MockLangService,
  MockMatDialog,
} from '@testing/test-helpers';
import { GlobalStorageService } from '@core/services/util/global-storage.service';
import { AnnounceService } from '@core/services/util/announce.service';
import { RoutingService } from '@core/services/util/routing.service';
import { DialogService } from '@core/services/util/dialog.service';
import { AuthenticationService } from '@core/services/http/authentication.service';
import { CommentService } from '@core/services/http/comment.service';
import { VoteService } from '@core/services/http/vote.service';
import { LanguageService } from '@core/services/util/language.service';
import { UserRole } from '@core/models/user-roles.enum';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule } from '@angular/material/menu';
import { of } from 'rxjs';
import { Comment } from '@core/models/comment';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  const mockAuthenticationService = jasmine.createSpyObj([
    'getCurrentAuthentication',
  ]);
  const auth = {
    userId: 'user1234',
  };
  mockAuthenticationService.getCurrentAuthentication.and.returnValue(of(auth));

  const mockRoutingService = jasmine.createSpyObj(['getRoleString']);

  const mockCommentService = jasmine.createSpyObj([
    'markCorrect',
    'toggleFavorite',
    'deleteComment',
    'toggleAck',
  ]);

  const mockVoteService = jasmine.createSpyObj([
    'vote-up',
    'vote-down',
    'deleteVote',
  ]);

  const mockDialogService = jasmine.createSpyObj([
    'openPublishGroupDialog',
    'openDeleteDialog',
  ]);

  const data = {
    viewRole: UserRole.PARTICIPANT,
  };
  const activatedRouteStub = new ActivatedRouteStub(null, data);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CommentComponent],
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
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
        {
          provide: VoteService,
          useValue: mockVoteService,
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
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    component.comment = new Comment();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
