import {
  AfterContentInit,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, provideTranslocoScope } from '@jsverse/transloco';
import { LanguageService } from '@app/core/services/util/language.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { Subject, take } from 'rxjs';
import { CoreModule } from '@app/core/core.module';
import { DateComponent } from '@app/standalone/date/date.component';
import { MatDialog } from '@angular/material/dialog';
import { CommentAnswerComponent } from '@app/standalone/_dialogs/comment-answer/comment-answer.component';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { VotingComponent } from '@app/standalone/voting/voting.component';
import { LanguageContextDirective } from '@app/core/directives/language-context.directive';
import {
  AcceptQnaPostGql,
  CorrectState,
  DeleteQnaPostGql,
  Post,
  RejectQnaPostGql,
  UpdateQnaActivePostIdGql,
  UpdateQnaPostCorrectGql,
  UpdateQnaPostFavoriteGql,
} from '@gql/generated/graphql';
import { AnnounceService } from '@app/core/services/util/announce.service';

@Component({
  imports: [
    CoreModule,
    DateComponent,
    ExtensionPointModule,
    LanguageContextDirective,
    VotingComponent,
  ],
  providers: [provideTranslocoScope('creator')],
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
  animations: [
    trigger('slide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('700ms', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class CommentComponent implements AfterContentInit {
  private notification = inject(NotificationService);
  private translateService = inject(TranslocoService);
  private dialogService = inject(DialogService);
  protected langService = inject(LanguageService);
  private globalStorageService = inject(GlobalStorageService);
  private dialog = inject(MatDialog);
  private setFavorite = inject(UpdateQnaPostFavoriteGql);
  private updateCorrect = inject(UpdateQnaPostCorrectGql);
  private deletePost = inject(DeleteQnaPostGql);
  private setActivePostId = inject(UpdateQnaActivePostIdGql);
  private acceptPost = inject(AcceptQnaPostGql);
  private rejectPost = inject(RejectQnaPostGql);
  private announceService = inject(AnnounceService);

  @Input({ required: true }) post!: Post;
  @Input() isEditor = false;

  @Input() animate = false;
  @Input() inReplyView = false;
  @Input() isSimpleView = false;
  @Input() isModeration = false;
  @Input() outlinedCard = false;
  @Input() activePostId?: string;
  @Input() qnaId?: string;

  @Output() clickedOnTag = new EventEmitter<string>();

  isInitialized = false;
  language: string;
  extensionData: any;
  extensionEvent: Subject<string> = new Subject<string>();
  destroyed$ = new Subject<void>();

  CorrectState = CorrectState;

  constructor() {
    const langService = this.langService;
    const globalStorageService = this.globalStorageService;

    langService.langEmitter.subscribe((lang) => {
      this.language = lang;
    });
    this.language = globalStorageService.getItem(STORAGE_KEYS.LANGUAGE);
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.isInitialized = true;
    });
  }

  setCorrect(correct: CorrectState): void {
    this.updateCorrect
      .mutate({
        variables: { id: this.post.id, correct: correct },
      })
      .subscribe();
  }

  markFavorite(): void {
    this.setFavorite
      .mutate({
        variables: { id: this.post.id, favorite: !this.post.favorite },
      })
      .subscribe();
  }

  replyComment() {
    if (!this.inReplyView) {
      this.dialog.open(CommentAnswerComponent, {
        maxWidth: '90vw',
        width: '832px',
        data: {
          post: this.post,
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
      () => this.deletePost.mutate({ variables: { id: this.post.id } })
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

  accept() {
    this.acceptPost
      .mutate({
        variables: { id: this.post.id },
      })
      .subscribe({
        next: () => {
          this.translateService
            .selectTranslate('comment-page.a11y-rejected')
            .pipe(take(1))
            .subscribe((status) => {
              this.announceService.announce(
                'comment-page.a11y-comment-has-been',
                {
                  status: status,
                }
              );
            });
        },
      });
  }

  reject() {
    this.rejectPost
      .mutate({
        variables: { id: this.post.id },
      })
      .subscribe({
        next: () => {
          this.translateService
            .selectTranslate('comment-page.a11y-banned')
            .pipe(take(1))
            .subscribe((status) => {
              this.announceService.announce(
                'comment-page.a11y-comment-has-been',
                {
                  status: status,
                }
              );
            });
        },
      });
  }

  openPresentDialog(): void {
    if (this.isEditor) {
      if (this.qnaId) {
        this.setActivePostId
          .mutate({
            variables: {
              id: this.qnaId,
              activePostId:
                this.activePostId === this.post.id ? null : this.post.id,
            },
          })
          .subscribe();
      }
    } else {
      this.replyComment();
    }
  }
}
