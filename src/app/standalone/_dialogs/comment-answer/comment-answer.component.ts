import { Component, ElementRef, ViewChild, inject } from '@angular/core';
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
    if (this.post.replies && this.post.replies.length < 0) {
      this.updateReply
        .mutate({ variables: { postId: this.post.id, body: this.bodyInput } })
        .subscribe({
          next: () => {
            const msg = this.translateService.translate(
              'creator.comment-page.comment-answered'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
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
            if (cacheId) {
              cache.modify({
                id: cacheId,
                fields: {
                  replies() {
                    return [result.data?.createQnaReply];
                  },
                },
              });
            }
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
              this.post = {
                id: this.post.id,
                body: this.post.body,
                moderationState: this.post.moderationState,
                createdAt: this.post.createdAt,
                score: this.post.score,
                userVote: this.post.userVote,
                replies: [reply],
              };
            }
            this.edit = false;
            this.enableForm();
          },
          error: () => this.enableForm(),
        });
    }
  }

  deleteAnswer() {
    const dialogRef = this.dialogService.openDeleteDialog(
      'comment-answer',
      'creator.dialog.really-delete-answer',
      undefined,
      undefined,
      () =>
        this.deleteReply.mutate({
          variables: { id: this.post.id },
          update: (cache) => {
            const cacheId = cache.identify({
              __typename: 'Post',
              id: this.post.id,
            });
            if (cacheId) {
              cache.modify({
                id: cacheId,
                fields: {
                  replies() {
                    return [];
                  },
                },
              });
            }
          },
        })
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.bodyInput = '';
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
