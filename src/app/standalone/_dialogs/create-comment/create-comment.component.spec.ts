import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CreateCommentComponent } from './create-comment.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommentService } from '@app/core/services/http/comment.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  MockMatDialogRef,
  MockNotificationService,
  MockGlobalStorageService,
} from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('CreateCommentComponent', () => {
  let component: CreateCommentComponent;
  let fixture: ComponentFixture<CreateCommentComponent>;

  const mockCommentService = jasmine.createSpyObj(['addComment']);

  const mockDialogData = {
    roomId: '1234',
    auth: {
      userId: 'user1234',
    },
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CreateCommentComponent,
        getTranslocoModule(),
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
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockDialogData,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
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
