import { AfterContentInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../services/util/language.service';
import { CommentService } from '../../../../services/http/comment.service';
import { Comment } from '../../../../models/comment';
import { AuthenticationService } from '../../../../services/http/authentication.service';
import { UserRole } from '../../../../models/user-roles.enum';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { DialogService } from '../../../../services/util/dialog.service';
import { EventService } from '../../../../services/util/event.service';
import { AnnounceService } from '../../../../services/util/announce.service';
import { MarkdownFeatureset } from '../../../../services/http/formatting.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HotkeyService } from '../../../../services/util/hotkey.service';

@Component({
  selector: 'app-comment-answer',
  templateUrl: './comment-answer.component.html',
  styleUrls: ['./comment-answer.component.scss']
})
export class CommentAnswerComponent implements OnInit, OnDestroy, AfterContentInit {

  comment: Comment;
  answer: string;
  isLoading = true;
  isParticipant = true;
  edit = false;
  MarkdownFeatureset = MarkdownFeatureset;
  renderPreview = false;

  private hotkeyRefs: Symbol[] = [];

  constructor(protected route: ActivatedRoute,
              private notificationService: NotificationService,
              private translateService: TranslateService,
              protected langService: LanguageService,
              protected commentService: CommentService,
              private authenticationService: AuthenticationService,
              private dialogService: DialogService,
              private announceService: AnnounceService,
              private eventService: EventService,
              private hotkeyService: HotkeyService,
              public dialogRef: MatDialogRef<CommentAnswerComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

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
    this.hotkeyService.registerHotkey({
      key: '2',
      action: () => this.announce(),
      actionTitle: 'TODO'
    }, this.hotkeyRefs);
  }

  ngOnDestroy() {
    this.hotkeyRefs.forEach(h => this.hotkeyService.unregisterHotkey(h));
  }

  public announce() {
    this.announceService.announce('comment-page.a11y-shortcuts-answer');
  }

  editAnswer() {
    this.edit = true;
    setTimeout(() => {
      document.getElementById('answer-input').focus();
    }, 500);
  }

  saveAnswer() {
    this.commentService.answer(this.comment, this.answer).subscribe(() => {
      this.translateService.get('comment-page.comment-answered').subscribe(msg => {
          this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
        }
      );
      this.edit = false;
    });
  }

  openDeleteAnswerDialog(): void {
    const dialogRef = this.dialogService.openDeleteDialog('really-delete-answer');
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteAnswer();
      }
    });
  }

  deleteAnswer() {
    this.answer = '';
    this.commentService.answer(this.comment, this.answer).subscribe(() => {
      this.translateService.get('comment-page.answer-deleted').subscribe(msg => {
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
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
