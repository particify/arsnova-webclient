import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommentComponent } from './comment.component';
import { NotificationService } from '@app/core/services/util/notification.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import {
  MockNotificationService,
  MockGlobalStorageService,
  MockAnnounceService,
} from '@testing/test-helpers';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { CommentService } from '@app/core/services/http/comment.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule } from '@angular/material/menu';
import { Comment } from '@app/core/models/comment';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { VoteService } from '@app/core/services/http/vote.service';
import {
  BROWSER_LANG,
  LanguageService,
} from '@app/core/services/util/language.service';

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
