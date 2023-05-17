import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommentAnswerComponent } from './comment-answer.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommentService } from '@app/core/services/http/comment.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  JsonTranslationLoader,
  MockAnnounceService,
  MockGlobalStorageService,
  MockLangService,
  MockMatDialogRef,
  MockNotificationService,
} from '@testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Comment } from '@app/core/models/comment';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CoreModule } from '@angular/flex-layout';
import { CommentComponent } from '@app/standalone/comment/comment.component';
import { VoteService } from '@app/core/services/http/vote.service';
import { LanguageService } from '@app/core/services/util/language.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

class MockVoteService {}

describe('CommentAnswerComponent', () => {
  let component: CommentAnswerComponent;
  let fixture: ComponentFixture<CommentAnswerComponent>;

  const mockCommentService = jasmine.createSpyObj(['answer']);

  const mockDialogService = jasmine.createSpyObj(['openDeleteDialog']);

  const mockDialogData = {
    comment: new Comment(),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommentAnswerComponent,
        CommentComponent,
        CoreModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
        MatTooltipModule,
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: NotificationService,
          useValue: MockNotificationService,
        },
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
        {
          provide: DialogService,
          useValue: mockDialogService,
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockDialogData,
        },
        {
          provide: VoteService,
          useClass: MockVoteService,
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
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
