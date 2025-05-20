import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentListBarExtensionComponent } from './comment-list-bar-extension.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { MockNotificationService } from '@testing/test-helpers';
import { DialogService } from '@app/core/services/util/dialog.service';
import { CommentService } from '@app/core/services/http/comment.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';

describe('CommentListBarExtensionComponent', () => {
  let component: CommentListBarExtensionComponent;
  let fixture: ComponentFixture<CommentListBarExtensionComponent>;

  const mockDialogService = jasmine.createSpyObj(['openDeleteDialog']);

  const mockCommentService = jasmine.createSpyObj([
    'deleteCommentsById',
    'deleteCommentsByRoomId',
    'export',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        getTranslocoModule(),
        MatMenuModule,
        CommentListBarExtensionComponent,
      ],
      providers: [
        {
          provide: DialogService,
          useValue: mockDialogService,
        },
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: Router,
          useValue: RouterTestingModule,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentListBarExtensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
