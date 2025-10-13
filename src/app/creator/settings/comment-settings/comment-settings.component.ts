import { Component, computed, inject, input } from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { FlexModule } from '@angular/flex-layout';
import { SettingsSlideToggleComponent } from '@app/standalone/settings-slide-toggle/settings-slide-toggle.component';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import {
  MatChipGrid,
  MatChipRow,
  MatChipRemove,
  MatChipInput,
} from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  CreateQnaTagGql,
  DeleteQnaTagGql,
  QnasByRoomIdGql,
  UpdateQnaAutoPublishGql,
  UpdateQnaThresholdGql,
} from '@gql/generated/graphql';
import { catchError, filter, of, switchMap } from 'rxjs';
import { NetworkStatus } from '@apollo/client';

@Component({
  selector: 'app-comment-settings',
  templateUrl: './comment-settings.component.html',
  styleUrls: ['./comment-settings.component.scss'],
  imports: [
    LoadingIndicatorComponent,
    FlexModule,
    SettingsSlideToggleComponent,
    MatSlider,
    MatSliderThumb,
    FormsModule,
    MatFormField,
    MatLabel,
    MatChipGrid,
    MatChipRow,
    MatIcon,
    MatChipRemove,
    MatChipInput,
    TranslocoPipe,
  ],
})
export class CommentSettingsComponent {
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslocoService);
  private qnasByRoomId = inject(QnasByRoomIdGql);
  private deleteTag = inject(DeleteQnaTagGql);
  private createTag = inject(CreateQnaTagGql);
  private setThreshold = inject(UpdateQnaThresholdGql);
  private setAutoPublish = inject(UpdateQnaAutoPublishGql);

  roomId = input.required<string>();
  newTagName = '';
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  qnaResult = toSignal(
    toObservable(this.roomId).pipe(
      switchMap((roomId) => {
        return this.qnasByRoomId.watch({
          variables: { roomId },
        }).valueChanges;
      }),
      filter((r) => r.dataState === 'complete'),
      catchError(() => of())
    )
  );

  isLoading = computed(() => {
    const status = this.qnaResult()?.networkStatus;
    if (status) {
      return status === NetworkStatus.loading;
    }
    return true;
  });

  private qnaData = computed(() => {
    const qna = this.qnaResult()?.data.qnasByRoomId;
    if (qna?.edges && qna.edges[0]) {
      return qna.edges[0]?.node;
    }
  });

  private qnaId = computed(() => this.qnaData()?.id);
  autoPublish = computed(() => this.qnaData()?.autoPublish ?? true);
  threshold = computed(() => this.qnaData()?.threshold);
  tags = computed(() => this.qnaData()?.tags ?? []);

  updateAutoPublish(autoPublish: boolean) {
    const id = this.qnaId();
    if (id) {
      this.setAutoPublish
        .mutate({
          variables: { id: id, autoPublish: autoPublish },
        })
        .subscribe();
    }
  }

  updateThreshold(threshold?: number) {
    const id = this.qnaId();
    if (id) {
      this.setThreshold
        .mutate({
          variables: {
            id: id,
            threshold:
              !threshold && this.threshold() === null ? -50 : threshold,
          },
        })
        .subscribe();
    }
  }

  addTag() {
    const qnaId = this.qnaId();
    if (!qnaId) {
      return;
    }
    if (this.newTagName.length > 0) {
      if (this.checkIfTagExists()) {
        const msg = this.translationService.translate(
          'creator.settings.tag-error'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      } else {
        this.createTag
          .mutate({
            variables: { qnaId: qnaId, name: this.newTagName },
            refetchQueries: ['QnasByRoomId'],
          })
          .subscribe({
            next: () => {
              const msg = this.translationService.translate(
                'creator.settings.tag-added'
              );
              this.notificationService.showAdvanced(
                msg,
                AdvancedSnackBarTypes.SUCCESS
              );
              this.newTagName = '';
            },
          });
      }
    }
  }

  private checkIfTagExists(): boolean {
    return (
      this.tags()
        .map((t) => t.name)
        .indexOf(this.newTagName.trim()) > -1
    );
  }

  removeTag(tagId: string) {
    this.deleteTag
      .mutate({
        variables: { id: tagId },
        refetchQueries: ['QnasByRoomId'],
      })
      .subscribe({
        next: () => {
          const msg = this.translationService.translate(
            'creator.settings.tag-removed'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.WARNING
          );
        },
      });
  }
}
