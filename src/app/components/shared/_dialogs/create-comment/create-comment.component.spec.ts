import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CreateCommentComponent } from './create-comment.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommentService } from '@arsnova/app/services/http/comment.service';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { JsonTranslationLoader,
  MockMatDialogRef,
  MockNotificationService,
  MockGlobalStorageService,
  MockLangService
} from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { LanguageService } from '@arsnova/app/services/util/language.service';

describe('CreateCommentComponent', () => {
  let component: CreateCommentComponent;
  let fixture: ComponentFixture<CreateCommentComponent>;

  const mockCommentService = jasmine.createSpyObj(['addComment']);

  const mockDialogData = {
    roomId: '1234',
    auth: {
      userId: 'user1234'
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        CreateCommentComponent
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        }),
        MatTooltipModule
      ],
      providers: [
        {
          provide: NotificationService,
          useValue: MockNotificationService
        },
        {
          provide: CommentService,
          useValue: mockCommentService
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: LanguageService,
          useClass: MockLangService
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockDialogData
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
