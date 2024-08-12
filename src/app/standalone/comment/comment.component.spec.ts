import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommentComponent } from './comment.component';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { NotificationService } from '@app/core/services/util/notification.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import {
  MockNotificationService,
  ActivatedRouteStub,
  MockGlobalStorageService,
  MockAnnounceService,
} from '@testing/test-helpers';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { CommentService } from '@app/core/services/http/comment.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule } from '@angular/material/menu';
import { Comment } from '@app/core/models/comment';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { VoteService } from '@app/core/services/http/vote.service';
import {
  BROWSER_LANG,
  LanguageService,
} from '@app/core/services/util/language.service';
import { Room } from '@app/core/models/room';

class MockLanguageService {
  langEmitter = new EventEmitter<string>();
}

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  const mockCommentService = jasmine.createSpyObj([
    'markCorrect',
    'toggleFavorite',
    'deleteComment',
    'toggleAck',
  ]);

  const mockDialogService = jasmine.createSpyObj([
    'openPublishGroupDialog',
    'openDeleteDialog',
  ]);

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.data = {
    room: new Room('1234', 'shortId', 'abbreviation', 'name', 'description'),
  };

  const data = {
    viewRole: UserRole.PARTICIPANT,
  };
  const activatedRouteStub = new ActivatedRouteStub(undefined, data, snapshot);

  const mockVoteService = jasmine.createSpyObj('VoteService', [
    'voteUp',
    'voteDown',
    'deleteVote',
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        getTranslocoModule(),
        CommentComponent,
        BrowserAnimationsModule,
        MatMenuModule,
      ],
      providers: [
        {
          provide: CommentService,
          useValue: mockCommentService,
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
          provide: DialogService,
          useValue: mockDialogService,
        },
        {
          provide: VoteService,
          useValue: mockVoteService,
        },
        {
          provide: LanguageService,
          useClass: MockLanguageService,
        },
        { provide: BROWSER_LANG, useValue: 'unsupported' },
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
