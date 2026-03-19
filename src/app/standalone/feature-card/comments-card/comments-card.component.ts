import { Component, Input, computed, inject, input } from '@angular/core';
import { catchError, filter, map, of, switchMap } from 'rxjs';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { FeatureCardComponent } from '@app/standalone/feature-card/feature-card.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule, FlexModule } from '@angular/flex-layout';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { DisabledIfReadonlyDirective } from '@app/core/directives/disabled-if-readonly.directive';
import {
  PauseQnaGql,
  QnaPostCountSummaryGql,
  QnasByRoomIdGql,
  QnaState,
  StartQnaGql,
  StopQnaGql,
} from '@gql/generated/graphql';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-comments-card',
  imports: [
    FeatureCardComponent,
    TranslocoPipe,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    FlexModule,
    FlexLayoutModule,
    DisabledIfReadonlyDirective,
  ],
  templateUrl: './comments-card.component.html',
})
export class CommentsCardComponent {
  private notificationService = inject(NotificationService);
  private qnasByRoomId = inject(QnasByRoomIdGql);
  private startQna = inject(StartQnaGql);
  private pauseQna = inject(PauseQnaGql);
  private stopQna = inject(StopQnaGql);
  private translateService = inject(TranslocoService);
  private postCounts = inject(QnaPostCountSummaryGql);

  @Input({ required: true }) description!: string;
  @Input() pausedDescription?: string;
  @Input() showCount = false;
  @Input() clickable = false;
  @Input() showControls = false;

  roomId = input.required<string>();
  qnaResult = toSignal(
    toObservable(this.roomId).pipe(
      switchMap((roomId) => {
        return this.qnasByRoomId.watch({
          variables: { roomId },
        }).valueChanges;
      }),
      filter((r) => r.dataState === 'complete'),
      map((r) => r.data.qnasByRoomId?.edges),
      catchError(() => of())
    )
  );

  private qnaId = computed(() => {
    const qna = this.qnaResult();
    if (qna && qna[0]) {
      return qna[0].node.id;
    }
  });
  state = computed(() => {
    const qna = this.qnaResult();
    if (qna && qna[0]) {
      return qna[0].node.state ?? QnaState.Stopped;
    }
    return QnaState.Stopped;
  });

  readonly postCountsResult = toSignal(
    toObservable(this.qnaId).pipe(
      switchMap((qnaId) => {
        if (!qnaId) {
          return of(null);
        }
        return this.postCounts.subscribe({ variables: { qnaId } });
      })
    )
  );

  readonly counts = computed(() => {
    return (
      this.postCountsResult()?.data?.qnaPostCountSummary ?? {
        accepted: 0,
        rejected: 0,
      }
    );
  });

  QnaState = QnaState;

  enableComments() {
    const id = this.qnaId();
    if (id) {
      this.startQna
        .mutate({
          variables: { id },
        })
        .subscribe((r) => {
          if (r.data) {
            const msg = this.translateService.translate(
              'comment-list.qna-started'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
          }
        });
    }
  }

  disableComments() {
    const id = this.qnaId();
    if (id) {
      this.stopQna.mutate({ variables: { id } }).subscribe((r) => {
        if (r.data) {
          const msg = this.translateService.translate(
            'comment-list.qna-stopped'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.WARNING
          );
        }
      });
    }
  }

  pauseComments() {
    const id = this.qnaId();
    if (id) {
      this.pauseQna.mutate({ variables: { id } }).subscribe((r) => {
        if (r.data) {
          const msg = this.translateService.translate(
            'comment-list.qna-paused'
          );

          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.WARNING
          );
        }
      });
    }
  }
}
