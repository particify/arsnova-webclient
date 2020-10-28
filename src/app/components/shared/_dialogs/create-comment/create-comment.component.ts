import { Component, Inject, OnInit } from '@angular/core';
import { Comment } from '../../../../models/comment';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators } from '@angular/forms';
import { ClientAuthentication } from '../../../../models/client-authentication';
import { CommentListComponent } from '../../comment-list/comment-list.component';
import { EventService } from '../../../../services/util/event.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';
import { Subject } from 'rxjs';
import { CommentService } from '../../../../services/http/comment.service';
import { LanguageService } from '../../../../services/util/language.service';
import { UserRole } from '../../../../models/user-roles.enum';

export interface DialogData {
  auth: ClientAuthentication;
  tags: string[];
  roomId: string;
  directSend: boolean;
  role: UserRole;
}

@Component({
  selector: 'app-submit-comment',
  templateUrl: './create-comment.component.html',
  styleUrls: ['./create-comment.component.scss']
})

export class CreateCommentComponent implements OnInit {

  comment: Comment;
  selectedTag: string;
  eventsSubject: Subject<string> = new Subject<string>();
  eventsWrapper: any;


  bodyForm = new FormControl('', [Validators.required]);

  constructor(
    private notification: NotificationService,
    public dialogRef: MatDialogRef<CommentListComponent>,
    private translateService: TranslateService,
    public dialog: MatDialog,
    private translationService: TranslateService,
    public eventService: EventService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private globalStorageService: GlobalStorageService,
    private commentService: CommentService,
    private notificationService: NotificationService,
    private langService: LanguageService
  ) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    this.eventsWrapper = {
      'eventsSubject': this.eventsSubject,
      'roomId': this.data.roomId,
      'userId': this.data.auth.userId
    };
  }

  onNoClick(): void {
    this.eventsSubject.next();
    this.dialogRef.close();
  }

  checkInputData(body: string): boolean {
    body = body.trim();
    if (!body) {
      this.translationService.get('dialog.error-comment').subscribe(message => {
        this.notification.showAdvanced(message, AdvancedSnackBarTypes.WARNING);
      });
      return false;
    }
    return true;
  }

  send(comment: Comment): void {
    let message;
    this.commentService.addComment(comment).subscribe(newComment => {
      this.eventsSubject.next(newComment.id);
      if (this.data.directSend) {
        if ([UserRole.CREATOR, UserRole.EDITING_MODERATOR, UserRole.EXECUTIVE_MODERATOR].indexOf(this.data.role) !== -1) {
          this.translateService.get('dialog.comment-sent').subscribe(msg => {
            message = msg;
          });
          comment.ack = true;
        } else {
          this.translateService.get('dialog.comment-sent-to-moderator').subscribe(msg => {
            message = msg;
          });
        }
      } else {
        this.translateService.get('dialog.comment-sent').subscribe(msg => {
          message = msg;
        });
      }
      this.notificationService.show(message);
    });
  }

  closeDialog(body: string) {
    if (this.checkInputData(body) === true) {
      const comment = new Comment();
      comment.roomId = this.globalStorageService.getItem(STORAGE_KEYS.ROOM_ID);
      comment.body = body;
      comment.creatorId = this.data.auth.userId;
      if (this.selectedTag !== null) {
        comment.tag = this.selectedTag;
      }
      this.send(comment);
      this.dialogRef.close();
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
