import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommentAnswerComponent } from './comment-answer.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommentService } from '@arsnova/app/services/http/comment.service';
import { DialogService } from '@arsnova/app/services/util/dialog.service';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { A11yIntroPipe } from '@arsnova/app/pipes/a11y-intro.pipe';
import {
  JsonTranslationLoader,
  MockMatDialogRef,
  MockNotificationService,
} from '@arsnova/testing/test-helpers';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Comment } from '@arsnova/app/models/comment';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CommentAnswerComponent', () => {
  let component: CommentAnswerComponent;
  let fixture: ComponentFixture<CommentAnswerComponent>;

  const mockCommentService = jasmine.createSpyObj(['answer']);

  const mockDialogService = jasmine.createSpyObj(['openDeleteDialog']);

  const mockDialogData = {
    comment: new Comment(),
  };

  let translateService: TranslateService;

  const a11yIntroPipe = new A11yIntroPipe(translateService);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CommentAnswerComponent, A11yIntroPipe],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
        MatTooltipModule,
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
          provide: A11yIntroPipe,
          useValue: a11yIntroPipe,
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
