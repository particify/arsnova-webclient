import { Component, Inject, OnInit } from '@angular/core';
import { Comment } from '@app/core/models/comment';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { Subject, take } from 'rxjs';
import { CommentService } from '@app/core/services/http/comment.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { CoreModule } from '@app/core/core.module';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { FormComponent } from '@app/standalone/form/form.component';
import { FormService } from '@app/core/services/util/form.service';

export interface DialogData {
  userId: string;
  tags: string[];
  roomId: string;
  directSend: boolean;
  fileUploadEnabled: boolean;
  role: UserRole;
}

@Component({
  standalone: true,
  imports: [CoreModule, ExtensionPointModule, LoadingButtonComponent],
  selector: 'app-submit-comment',
  templateUrl: './create-comment.component.html',
})
export class CreateCommentComponent extends FormComponent implements OnInit {
  readonly dialogId = 'create-comment';

  selectedTag?: string;
  eventsSubject = new Subject<string | void>();
  eventsWrapper: any;

  constructor(
    public dialogRef: MatDialogRef<CreateCommentComponent>,
    private translateService: TranslocoService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private globalStorageService: GlobalStorageService,
    private commentService: CommentService,
    private notificationService: NotificationService,
    protected formService: FormService
  ) {
    super(formService);
  }

  ngOnInit() {
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.eventsWrapper = {
      eventsSubject: this.eventsSubject,
      role: this.data.role,
      userId: this.data.userId,
    };
  }

  onNoClick(): void {
    this.eventsSubject.next();
    this.dialogRef.close();
  }

  updateTag(tag: string) {
    this.selectedTag = tag;
  }

  send(comment: Comment): void {
    let message: string;
    this.disableForm();
    this.commentService.addComment(comment).subscribe(
      (newComment) => {
        this.eventsSubject.next(newComment.id);
        if (this.data.directSend) {
          this.translateService
            .selectTranslate('comment-page.comment-sent')
            .pipe(take(1))
            .subscribe((msg) => {
              message = msg;
            });
          comment.ack = true;
        } else {
          this.translateService
            .selectTranslate('comment-page.comment-sent-to-moderator')
            .pipe(take(1))
            .subscribe((msg) => {
              message = msg;
            });
        }
        this.notificationService.showAdvanced(
          message,
          AdvancedSnackBarTypes.SUCCESS
        );
        this.dialogRef.close(true);
      },
      () => {
        this.enableForm();
      }
    );
  }

  closeDialog(body?: string) {
    body = body?.trim();
    if (!body) {
      this.translateService
        .selectTranslate('comment-page.error-comment')
        .pipe(take(1))
        .subscribe((message) => {
          this.notificationService.showAdvanced(
            message,
            AdvancedSnackBarTypes.WARNING
          );
        });
      return;
    }
    const comment = new Comment();
    comment.roomId = this.data.roomId;
    comment.body = body;
    comment.creatorId = this.data.userId;
    if (this.selectedTag) {
      comment.tag = this.selectedTag;
    }
    this.send(comment);
  }
}
