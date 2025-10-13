import { Component, OnInit, inject } from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@jsverse/transloco';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { take } from 'rxjs';
import { CoreModule } from '@app/core/core.module';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { FormComponent } from '@app/standalone/form/form.component';
import { CreateQnaPostGql, Tag } from '@gql/generated/graphql';

export interface DialogData {
  qnaId: string;
  tags: Tag[];
  roomId: string;
  autoPublish: boolean;
}

@Component({
  imports: [CoreModule, LoadingButtonComponent],
  selector: 'app-submit-comment',
  templateUrl: './create-comment.component.html',
})
export class CreateCommentComponent extends FormComponent implements OnInit {
  dialogRef = inject<MatDialogRef<CreateCommentComponent>>(MatDialogRef);
  private translateService = inject(TranslocoService);
  data = inject<DialogData>(MAT_DIALOG_DATA);
  private globalStorageService = inject(GlobalStorageService);
  private notificationService = inject(NotificationService);
  private createPost = inject(CreateQnaPostGql);

  readonly dialogId = 'create-comment';

  selectedTag?: Tag;

  ngOnInit() {
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
  }

  updateTag(tag?: Tag) {
    this.selectedTag = tag;
  }

  addPost(body?: string): void {
    body = body?.trim();
    if (!body) {
      this.translateService
        .selectTranslate('comment-page.error-comment')
        .pipe(take(1))
        .subscribe((message) => {
          this.notificationService.showAdvanced(
            message,
            AdvancedSnackBarTypes.WARNING
          );
        });
      return;
    }
    this.disableForm();
    this.createPost
      .mutate({
        variables: {
          qnaId: this.data.qnaId,
          body: body,
          tagIds: this.selectedTag ? [this.selectedTag.id] : null,
        },
      })
      .subscribe({
        next: () => {
          const msg = this.translateService.translate(
            this.data.autoPublish
              ? 'comment-page.comment-sent'
              : 'comment-page.comment-sent-to-moderator'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
          this.dialogRef.close(true);
        },
        error: () => {
          this.enableForm();
        },
      });
  }
}
