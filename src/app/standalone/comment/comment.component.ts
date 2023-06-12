import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Comment } from '@app/core/models/comment';
import { CommentService } from '@app/core/services/http/comment.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '@app/core/services/util/language.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CorrectWrong } from '@app/core/models/correct-wrong.enum';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { Observable, Subject } from 'rxjs';
import { CoreModule } from '@app/core/core.module';
import { DateComponent } from '@app/standalone/date/date.component';
import { MatDialog } from '@angular/material/dialog';
import { CommentAnswerComponent } from '@app/standalone/_dialogs/comment-answer/comment-answer.component';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';

@Component({
  standalone: true,
  imports: [CoreModule, DateComponent, ExtensionPointModule],
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
  animations: [
    trigger('slide', [
      state('hidden', style({ opacity: 0, transform: 'translateY(-10px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden <=> visible', animate(700)),
    ]),
  ],
})
export class CommentComponent implements OnInit, OnDestroy {
  @Input() comment: Comment;
  @Input() isEditor = false;

  @Input() isNew: boolean;
  @Input() referenceEvent: Observable<string>;
  @Input() inAnswerView = false;
  @Input() archived = false;
  @Input() isSimpleView = false;
  @Input() isModeration = false;
  @Input() fileUploadEnabled = false;

  @Output() clickedOnTag = new EventEmitter<string>();
  @Output() activeComment = new EventEmitter<Comment>();

  language: string;
  slideAnimationState = 'hidden';
  extensionData: any;
  extensionEvent: Subject<string> = new Subject<string>();
  destroyed$ = new Subject<void>();

  constructor(
    private commentService: CommentService,
    private notification: NotificationService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    protected langService: LanguageService,
    private announceService: AnnounceService,
    private globalStorageService: GlobalStorageService,
    private dialog: MatDialog
  ) {
    langService.langEmitter.subscribe((lang) => {
      this.language = lang;
    });
  }

  ngOnInit() {
    this.language = this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE);
    this.translateService.use(this.language);
    this.extensionData = {
      roomId: this.comment.roomId,
      refId: this.comment.id,
      refType: 'comment',
      detailedView: false,
      pureImageView: true,
      retryEvent: this.extensionEvent,
    };
    if (this.referenceEvent) {
      this.referenceEvent.subscribe((id) => {
        if (this.comment.id === id) {
          this.extensionEvent.next(this.comment.id);
        }
      });
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  changeSlideState(): void {
    this.slideAnimationState = 'visible';
  }

  markCorrect(type: CorrectWrong): void {
    if (this.comment.correct === type) {
      this.comment.correct = CorrectWrong.NULL;
    } else {
      this.comment.correct = type;
    }
    this.commentService
      .markCorrect(this.comment)
      .subscribe((updatedComment) => (this.comment = updatedComment));
  }

  setFavorite(): void {
    this.commentService
      .toggleFavorite(this.comment)
      .subscribe((updatedComment) => (this.comment = updatedComment));
  }

  openDeleteCommentDialog(): void {
    const dialogRef = this.dialogService.openDeleteDialog(
      'comment',
      'really-delete-comment'
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.delete();
      }
    });
  }

  answerComment() {
    if (!this.inAnswerView) {
      this.dialog.open(CommentAnswerComponent, {
        panelClass: 'screen-dialog',
        data: {
          comment: this.comment,
          isEditor: this.isEditor,
        },
      });
    }
  }

  delete(): void {
    this.commentService.deleteComment(this.comment).subscribe(() => {
      this.translateService
        .get('comment-list.comment-deleted')
        .subscribe((msg) => {
          this.notification.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
        });
    });
  }

  setAck(): void {
    this.commentService
      .toggleAck(this.comment)
      .subscribe((updatedComment) => (this.comment = updatedComment));
    this.translateService
      .get(
        this.comment.ack
          ? 'comment-page.a11y-rejected'
          : 'comment-page.a11y-banned'
      )
      .subscribe((status) => {
        this.announceService.announce('comment-page.a11y-comment-has-been', {
          status: status,
        });
      });
  }

  openPresentDialog(): void {
    if (this.isEditor) {
      this.activeComment.emit(this.comment);
    } else {
      this.answerComment();
    }
  }
}
