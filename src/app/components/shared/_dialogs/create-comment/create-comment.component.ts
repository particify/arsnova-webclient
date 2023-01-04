import { Component, Inject, OnInit } from '@angular/core';
import { Comment } from '../../../../models/comment';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '../../../../services/util/notification.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { ClientAuthentication } from '../../../../models/client-authentication';
import { CommentListComponent } from '../../comment-list/comment-list.component';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '../../../../services/util/global-storage.service';
import { Subject } from 'rxjs';
import { CommentService } from '../../../../services/http/comment.service';
import { LanguageService } from '../../../../services/util/language.service';
import { UserRole } from '../../../../models/user-roles.enum';

export interface DialogData {
  auth: ClientAuthentication;
  tags: string[];
  roomId: string;
  directSend: boolean;
  fileUploadEnabled: boolean;
  role: UserRole;
}

@Component({
  selector: 'app-submit-comment',
  templateUrl: './create-comment.component.html',
})
export class CreateCommentComponent implements OnInit {
  readonly dialogId = 'create-comment';

  comment: Comment;
  selectedTag: string;
  eventsSubject = new Subject<string | void>();
  eventsWrapper: any;

  bodyForm = new UntypedFormControl('', [Validators.required]);

  constructor(
    public dialogRef: MatDialogRef<CommentListComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private globalStorageService: GlobalStorageService,
    private commentService: CommentService,
    private notificationService: NotificationService,
    protected langService: LanguageService
  ) {
    langService.langEmitter.subscribe((lang) => translateService.use(lang));
  }

  ngOnInit() {
    this.translateService.use(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.eventsWrapper = {
      eventsSubject: this.eventsSubject,
      role: this.data.role,
      userId: this.data.auth.userId,
    };
  }

  onNoClick(): void {
    this.eventsSubject.next();
    this.dialogRef.close();
  }

  checkInputData(body: string): boolean {
    body = body.trim();
    if (!body) {
      this.translateService.get('dialog.error-comment').subscribe((message) => {
        this.notificationService.showAdvanced(
          message,
          AdvancedSnackBarTypes.WARNING
        );
      });
      return false;
    }
    return true;
  }

  updateTag(tag) {
    this.selectedTag = tag;
  }

  send(comment: Comment): void {
    let message;
    this.commentService.addComment(comment).subscribe((newComment) => {
      this.eventsSubject.next(newComment.id);
      if (this.data.directSend) {
        this.translateService.get('dialog.comment-sent').subscribe((msg) => {
          message = msg;
        });
        comment.ack = true;
      } else {
        this.translateService
          .get('dialog.comment-sent-to-moderator')
          .subscribe((msg) => {
            message = msg;
          });
      }
      this.notificationService.showAdvanced(
        message,
        AdvancedSnackBarTypes.SUCCESS
      );
      this.dialogRef.close(true);
    });
  }

  closeDialog(body: string) {
    if (this.checkInputData(body) === true) {
      const comment = new Comment();
      comment.roomId = this.data.roomId;
      comment.body = body;
      comment.creatorId = this.data.auth.userId;
      if (this.selectedTag !== null) {
        comment.tag = this.selectedTag;
      }
      this.send(comment);
    }
  }

  /**
   * Returns a lambda which closes the dialog on call.
   */
  buildCloseDialogActionCallback(): () => void {
    return () => this.onNoClick();
  }

  /**
   * Returns a lambda which executes the dialog dedicated action on call.
   */
  buildCreateCommentActionCallback(text: HTMLInputElement): () => void {
    return () => this.closeDialog(text.value);
  }
}
