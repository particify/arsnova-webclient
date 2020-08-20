import { Component, Inject, OnInit } from '@angular/core';
import { Comment } from '../../../../models/comment';
import { NotificationService } from '../../../../services/util/notification.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators } from '@angular/forms';
import { ClientAuthentication } from 'app/models/client-authentication';
import { CommentListComponent } from '../../comment-list/comment-list.component';
import { EventService } from '../../../../services/util/event.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';

export interface DialogData {
  auth: ClientAuthentication;
  tags: string[];
}

@Component({
  selector: 'app-submit-comment',
  templateUrl: './create-comment.component.html',
  styleUrls: ['./create-comment.component.scss']
})
export class CreateCommentComponent implements OnInit {

  comment: Comment;
  selectedTag: string;

  bodyForm = new FormControl('', [Validators.required]);

  constructor(
    private notification: NotificationService,
    public dialogRef: MatDialogRef<CommentListComponent>,
    private translateService: TranslateService,
    public dialog: MatDialog,
    private translationService: TranslateService,
    public eventService: EventService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private globalStorageService: GlobalStorageService
  ) {
  }

  ngOnInit() {
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  checkInputData(body: string): boolean {
    body = body.trim();
    if (!body) {
      this.translationService.get('dialog.error-comment').subscribe(message => {
        this.notification.show(message);
      });
      return false;
    }
    return true;
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
      this.dialogRef.close(comment);
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
