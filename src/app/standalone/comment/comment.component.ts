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
import { TranslocoService, provideTranslocoScope } from '@ngneat/transloco';
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
import { Observable, Subject, take } from 'rxjs';
import { CoreModule } from '@app/core/core.module';
import { DateComponent } from '@app/standalone/date/date.component';
import { MatDialog } from '@angular/material/dialog';
import { CommentAnswerComponent } from '@app/standalone/_dialogs/comment-answer/comment-answer.component';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { VotingComponent } from '@app/standalone/voting/voting.component';
import { Vote } from '@app/core/models/vote';

@Component({
  standalone: true,
  imports: [CoreModule, DateComponent, ExtensionPointModule, VotingComponent],
  providers: [provideTranslocoScope('creator')],
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
  @Input({ required: true }) comment!: Comment;
  @Input() isEditor = false;

  @Input() isNew = false;
  @Input() referenceEvent?: Observable<string>;
  @Input() inAnswerView = false;
  @Input() archived = false;
  @Input() isSimpleView = false;
  @Input() isModeration = false;
  @Input() fileUploadEnabled = false;
  @Input() parseVote?: Vote;
  @Input() userId?: string;

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
    private translateService: TranslocoService,
    private dialogService: DialogService,
    protected langService: LanguageService,
    private announceService: AnnounceService,
    private globalStorageService: GlobalStorageService,
    private dialog: MatDialog
  ) {
    langService.langEmitter.subscribe((lang) => {
      this.language = lang;
    });
    this.language = globalStorageService.getItem(STORAGE_KEYS.LANGUAGE);
  }

  ngOnInit() {
    this.translateService.setActiveLang(this.language);
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

  deleteComment(): void {
    const dialogRef = this.dialogService.openDeleteDialog(
      'comment',
      'creator.dialog.really-delete-comment',
      undefined,
      undefined,
      () => this.commentService.deleteComment(this.comment)
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.translateService
          .selectTranslate('comment-list.comment-deleted')
          .pipe(take(1))
          .subscribe((msg) => {
            this.notification.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
          });
      }
    });
  }

  setAck(): void {
    this.commentService
      .toggleAck(this.comment)
      .subscribe((updatedComment) => (this.comment = updatedComment));
    this.translateService
      .selectTranslate(
        this.comment.ack
          ? 'comment-page.a11y-rejected'
          : 'comment-page.a11y-banned'
      )
      .pipe(take(1))
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
