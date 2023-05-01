import { AfterContentInit, Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CommentService } from '@app/core/services/http/comment.service';
import { Comment } from '@app/core/models/comment';
import { UserRole } from '@app/core/models/user-roles.enum';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { MarkdownFeatureset } from '@app/core/services/http/formatting.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-comment-answer',
  templateUrl: './comment-answer.component.html',
  styleUrls: ['./comment-answer.component.scss'],
})
export class CommentAnswerComponent implements OnInit, AfterContentInit {
  readonly dialogId = 'comment-answer';

  comment: Comment;
  answer: string;
  isLoading = true;
  isParticipant = true;
  edit = false;
  MarkdownFeatureset = MarkdownFeatureset;
  renderPreview = false;

  constructor(
    private notificationService: NotificationService,
    private translateService: TranslateService,
    protected commentService: CommentService,
    private dialogService: DialogService,
    public dialogRef: MatDialogRef<CommentAnswerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngAfterContentInit() {
    setTimeout(() => {
      if (this.isParticipant) {
        document.getElementById('answer-text').focus();
      } else {
        document.getElementById('message-button').focus();
      }
    }, 700);
  }

  ngOnInit() {
    this.comment = this.data.comment;
    this.answer = this.comment.answer;
    this.isParticipant = this.data.role === UserRole.PARTICIPANT;
  }

  editAnswer() {
    this.edit = true;
    setTimeout(() => {
      document.getElementById('answer-input').focus();
    }, 500);
  }

  saveAnswer() {
    this.commentService.answer(this.comment, this.answer).subscribe(() => {
      this.translateService
        .get('comment-page.comment-answered')
        .subscribe((msg) => {
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
        });
      this.edit = false;
    });
  }

  openDeleteAnswerDialog(): void {
    const dialogRef = this.dialogService.openDeleteDialog(
      'comment-answer',
      'really-delete-answer'
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteAnswer();
      }
    });
  }

  deleteAnswer() {
    this.answer = '';
    this.commentService.answer(this.comment, this.answer).subscribe(() => {
      this.translateService
        .get('comment-page.answer-deleted')
        .subscribe((msg) => {
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.WARNING
          );
        });
    });
  }

  tabChanged($event) {
    this.renderPreview = $event.index === 1;
  }

  close() {
    this.dialogRef.close();
  }
}