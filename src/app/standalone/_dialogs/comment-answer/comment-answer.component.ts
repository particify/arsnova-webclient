import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { provideTranslocoScope, TranslocoService } from '@jsverse/transloco';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { MarkdownFeatureset } from '@app/core/services/http/formatting.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CoreModule } from '@app/core/core.module';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { DateComponent } from '@app/standalone/date/date.component';
import { FormattingToolbarComponent } from '@app/standalone/formatting-toolbar/formatting-toolbar.component';
import { FormComponent } from '@app/standalone/form/form.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { LanguageContextDirective } from '@app/core/directives/language-context.directive';
import {
  CreateQnaReplyGql,
  DeleteQnaReplyGql,
  Post,
  UpdateQnaReplyGql,
} from '@gql/generated/graphql';

@Component({
  imports: [
    CoreModule,
    RenderedTextComponent,
    DateComponent,
    FormattingToolbarComponent,
    LoadingButtonComponent,
    LanguageContextDirective,
  ],
  providers: [provideTranslocoScope('creator')],
  selector: 'app-comment-answer',
  templateUrl: './comment-answer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./comment-answer.component.scss'],
})
export class CommentAnswerComponent extends FormComponent {
  private notificationService = inject(NotificationService);
  private translateService = inject(TranslocoService);
  private dialogService = inject(DialogService);
  private createReply = inject(CreateQnaReplyGql);
  private updateReply = inject(UpdateQnaReplyGql);
  private deleteReply = inject(DeleteQnaReplyGql);
  dialogRef = inject<MatDialogRef<CommentAnswerComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  readonly dialogId = 'comment-answer';
  @ViewChild('answerInput') answerInput!: ElementRef;

  post: Post;
  bodyInput?: string;
  edit = false;
  isEditor: boolean;
  MarkdownFeatureset = MarkdownFeatureset;
  renderPreview = false;

  constructor() {
    super();
    this.post = this.data.post;
    if (this.post.replies && this.post.replies.length > 0) {
      this.bodyInput = this.post.replies[0].body;
    }
    this.isEditor = !!this.data.isEditor;
  }

  editAnswer() {
    this.edit = true;
    setTimeout(() => {
      this.answerInput.nativeElement.focus();
    });
  }

  saveAnswer() {
    if (!this.bodyInput) {
      const msg = this.translateService.translate(
        'creator.comment-page.please-enter-reply'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
      return;
    }
    this.disableForm();
    const reply = this.post.replies?.[0];
    if (reply) {
      this.updateReply
        .mutate({ variables: { id: reply.id, body: this.bodyInput } })
        .subscribe({
          next: (result) => {
            const msg = this.translateService.translate(
              'creator.comment-page.comment-answered'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
            const updatedReply = result.data?.updateQnaReply;
            if (updatedReply) {
              this.post = { ...this.post, replies: [updatedReply] };
            }
            this.edit = false;
            this.enableForm();
          },
          error: () => this.enableForm(),
        });
    } else {
      this.createReply
        .mutate({
          variables: { postId: this.post.id, body: this.bodyInput },
          update: (cache, result) => {
            const cacheId = cache.identify({
              __typename: 'Post',
              id: this.post.id,
            });
            const reply = result.data?.createQnaReply;
            if (!cacheId || !reply) {
              return;
            }
            cache.modify({
              id: cacheId,
              fields: {
                replies(existingReplies, { toReference }) {
                  const replyRef = toReference(reply, true);
                  return replyRef ? [replyRef] : existingReplies;
                },
              },
            });
          },
        })
        .subscribe({
          next: (result) => {
            const msg = this.translateService.translate(
              'creator.comment-page.comment-answered'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
            const reply = result.data?.createQnaReply;
            if (reply) {
              this.post = { ...this.post, replies: [reply] };
            }
            this.edit = false;
            this.enableForm();
          },
          error: () => this.enableForm(),
        });
    }
  }

  deleteAnswer() {
    const reply = this.post.replies?.[0];
    if (!reply) {
      return;
    }
    const dialogRef = this.dialogService.openDeleteDialog(
      'comment-answer',
      'creator.dialog.really-delete-answer',
      undefined,
      undefined,
      () =>
        this.deleteReply.mutate({
          variables: { id: reply.id },
          update: (cache) => {
            const postCacheId = cache.identify({
              __typename: 'Post',
              id: this.post.id,
            });
            if (postCacheId) {
              cache.modify({
                id: postCacheId,
                fields: {
                  replies() {
                    return [];
                  },
                },
              });
            }
            const replyCacheId = cache.identify(reply);
            if (replyCacheId) {
              cache.evict({ id: replyCacheId });
            }
          },
        })
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.bodyInput = '';
        this.post = { ...this.post, replies: [] };
        const msg = this.translateService.translate(
          'creator.comment-page.answer-deleted'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      }
    });
  }

  tabChanged($event: MatTabChangeEvent) {
    this.renderPreview = $event.index === 1;
  }

  close() {
    this.dialogRef.close();
  }
}
