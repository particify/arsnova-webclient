import {
  ChangeDetectionStrategy,
  Component,
  inject,
  computed,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { catchError, filter, map, of, startWith, switchMap } from 'rxjs';
import { AbstractRoomOverviewPageComponent } from '@app/common/abstract/abstract-room-overview-page';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { HintType } from '@app/core/models/hint-type.enum';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { AsyncPipe } from '@angular/common';
import { CoreModule } from '@app/core/core.module';
import { FlexModule } from '@angular/flex-layout';
import { FeatureCardComponent } from '@app/standalone/feature-card/feature-card.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { CommentsCardComponent } from '@app/standalone/feature-card/comments-card/comments-card.component';
import { LiveFeedbackCardComponent } from '@app/standalone/feature-card/live-feedback-card/live-feedback-card.component';
import { LanguageContextDirective } from '@app/core/directives/language-context.directive';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';
import { RoomInfoComponentComponent } from '@app/standalone/room-info-component/room-info-component.component';
import { ExpandableCardComponent } from '@app/standalone/expandable-card/expandable-card.component';
import {
  PublishedQuestionnairesByRoomIdGql,
  QnasByRoomIdGql,
  QnaState,
  QuestionnairesChangedGql,
  QuestionnaireSummaryFragment,
} from '@gql/generated/graphql';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { QuestionnaireComponent } from '@app/standalone/questionnaire/questionnaire.component';
import { refetchOn } from '@gql/helper/refetch-on';

@Component({
  selector: 'app-participant-overview',
  templateUrl: './room-overview-page.component.html',
  styleUrls: ['../../common/styles/room-overview.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    FlexModule,
    CoreModule,
    LoadingIndicatorComponent,
    ExtensionPointModule,
    AsyncPipe,
    TranslocoPipe,
    FeatureCardComponent,
    RenderedTextComponent,
    CommentsCardComponent,
    LiveFeedbackCardComponent,
    LanguageContextDirective,
    RoomInfoComponentComponent,
    ExpandableCardComponent,
    QuestionnaireComponent,
  ],
})
export class RoomOverviewPageComponent extends AbstractRoomOverviewPageComponent {
  private readonly qnasByRoomId = inject(QnasByRoomIdGql);
  private readonly focusModeService = inject(FocusModeService);
  private readonly roomSettingsService = inject(RoomSettingsService);
  private readonly questionnairesByRoomId = inject(
    PublishedQuestionnairesByRoomIdGql
  );
  private readonly questionnairesChanged = inject(QuestionnairesChangedGql);

  readonly qnaResult = toSignal(
    toObservable(this.roomId).pipe(
      switchMap((roomId) => {
        return this.qnasByRoomId.watch({
          variables: {
            roomId,
          },
        }).valueChanges;
      }),
      filter((r) => r.dataState === 'complete'),
      map((r) => r.data.qnasByRoomId),
      catchError(() => of())
    )
  );

  readonly feedbackEnabled = toSignal(
    toObservable(this.roomId).pipe(
      switchMap((roomId) =>
        this.roomSettingsService.getByRoomId(roomId).pipe(
          switchMap((settings) =>
            this.roomSettingsService
              .getRoomSettingsStream(roomId, settings.id)
              .pipe(
                map((update) => update.surveyEnabled ?? settings.surveyEnabled),
                startWith(settings.surveyEnabled)
              )
          )
        )
      )
    )
  );

  readonly commentsEnabled = computed(() => {
    const qna = this.qnaResult();
    if (qna?.edges && qna.edges[0]) {
      return qna.edges[0]?.node.state !== QnaState.Stopped;
    }
  });
  readonly focusModeEnabled = toSignal(
    this.focusModeService.getFocusModeEnabled()
  );
  readonly HintType = HintType;

  readonly questionnairesResult = toSignal(
    toObservable(this.roomId).pipe(
      switchMap((roomId) =>
        refetchOn(
          this.questionnairesByRoomId.watch({ variables: { roomId } }),
          this.questionnairesChanged.subscribe({ variables: { roomId } })
        )
      )
    )
  );

  readonly questionnaires = computed(() =>
    (
      this.questionnairesResult()?.data?.publishedQuestionnairesByRoomId ?? []
    ).filter((q): q is QuestionnaireSummaryFragment => !!q)
  );

  readonly loadingQuestionnaires = computed(
    () => this.questionnairesResult()?.loading
  );
}
