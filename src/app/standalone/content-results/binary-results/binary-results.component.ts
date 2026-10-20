import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  combineLatest,
  EMPTY,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  take,
} from 'rxjs';
import { Apollo, onlyCompleteData } from 'apollo-angular';
import { updateRoundOn } from '@gql/helper/recover-deleted-round';
import { TranslocoService } from '@jsverse/transloco';
import {
  BinaryContentFormatData,
  BinaryContentRoundStats,
  QuestionnaireBinaryRoundStatsByRoundIdGql,
  QuestionnaireBinaryRoundStatsUpdatedGql,
  Round,
} from '@gql/generated/graphql';
import { CoreModule } from '@app/core/core.module';
import { LanguageService } from '@app/core/services/util/language.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { BarChartComponent } from '@app/standalone/content-results/visualization/chart/bar-chart.component';
import { CorrectAnswerResultsComponent } from '@app/standalone/correct-answer-results/correct-answer-results.component';

/**
 * A binary content stores no options, so both labels come from i18n. They are
 * resolved in the room's language: unlike the answer form, the results are
 * projected to the room.
 */
const BINARY_OPTION_KEYS = ['answer.yes', 'answer.no'];

@Component({
  selector: 'app-binary-results',
  templateUrl: './binary-results.component.html',
  styleUrls: ['./binary-results.component.scss'],
  imports: [BarChartComponent, CoreModule, CorrectAnswerResultsComponent],
})
export class BinaryResultsComponent {
  private readonly apollo = inject(Apollo);
  private readonly themeService = inject(ThemeService);
  private readonly presentationService = inject(PresentationService);
  private readonly translateService = inject(TranslocoService);
  private readonly languageService = inject(LanguageService);
  private readonly roundStatsByRoundId = inject(
    QuestionnaireBinaryRoundStatsByRoundIdGql
  );
  private readonly binaryRoundStatsUpdated = inject(
    QuestionnaireBinaryRoundStatsUpdatedGql
  );

  readonly roundIds = input.required<string[]>();
  readonly rounds = input.required<Round[]>();
  readonly formatData = input.required<BinaryContentFormatData>();
  readonly hasCorrectAnswer = input(false);
  readonly showCorrect = input(false);
  readonly resultsVisible = input(true);
  readonly visualizationUnitPercent = input(false);
  readonly isPresentation = input(false);
  readonly answerCount = input(0);
  readonly correctAnswerCount = input(0);
  readonly abstentionCount = input(0);
  readonly language = input<string>();

  readonly scale = computed(() =>
    this.isPresentation() ? this.presentationService.scale() : 1
  );

  private statsForRound(
    roundId: string
  ): Observable<BinaryContentRoundStats | null | undefined> {
    return updateRoundOn(
      this.apollo.client,
      this.roundStatsByRoundId.watch({
        variables: { roundId },
        fetchPolicy: 'cache-and-network',
      }),
      this.isClosed(roundId)
        ? EMPTY
        : this.binaryRoundStatsUpdated.subscribe({ variables: { roundId } }),
      (r) =>
        r.data && {
          questionnaireBinaryRoundStatsByRoundId:
            r.data.questionnaireBinaryRoundStatsUpdated,
        }
    ).pipe(
      onlyCompleteData(),
      map((r) => r.data?.questionnaireBinaryRoundStatsByRoundId)
    );
  }

  readonly roundStatsList = toSignal(
    toObservable(this.roundIds).pipe(
      switchMap((roundIds) =>
        roundIds.length
          ? combineLatest(
              roundIds.map((roundId) => this.statsForRound(roundId))
            )
          : of([])
      )
    )
  );

  readonly comparingRounds = computed(() => this.roundIds().length > 1);

  /**
   * The room's language where it has translations, else the active one. That
   * language may not be loaded yet, hence `selectTranslate`.
   */
  readonly labels = toSignal(
    toObservable(
      computed(() => this.languageService.ensureValidLang(this.language()))
    ).pipe(
      switchMap((lang) =>
        forkJoin(
          BINARY_OPTION_KEYS.map((key) =>
            this.translateService
              .selectTranslate<string>(key, undefined, lang)
              .pipe(take(1))
          )
        )
      )
    ),
    { initialValue: [] as string[] }
  );

  /** On the reveal the correct bar keeps its colour and the other turns grey. */
  private readonly colors = computed(() => {
    const colors = this.themeService.getBinaryColors();
    const correctAnswer = this.formatData().correctAnswer;
    if (
      !this.showCorrect() ||
      !this.hasCorrectAnswer() ||
      correctAnswer === null ||
      correctAnswer === undefined
    ) {
      return colors;
    }
    const correctIndex = correctAnswer ? 0 : 1;
    const wrongColor = this.themeService.getColor('grey');
    return colors.map((color, index) =>
      index === correctIndex ? color : wrongColor
    );
  });

  readonly visualizationData = computed(() => {
    const stats = this.roundStatsList() ?? [];
    return {
      labels: this.labels(),
      datasets: this.roundIds().map((roundId, i) => ({
        values: BINARY_OPTION_KEYS.map(
          (_, index) => stats[i]?.selectionCounts?.[index] ?? 0
        ),
        colors: this.colors(),
        label: this.comparingRounds() ? this.roundLabel(roundId) : undefined,
      })),
    };
  });

  /** The server counts yes first, so a correct yes is the label at index 0. */
  readonly correctLabel = computed(() => {
    const correctAnswer = this.formatData().correctAnswer;
    return correctAnswer === null || correctAnswer === undefined
      ? undefined
      : this.labels()[correctAnswer ? 0 : 1];
  });

  /** A closed round's answers cannot change, so it needs no updates. */
  private isClosed(roundId: string): boolean {
    return !!this.rounds().find((round) => round.id === roundId)?.closed;
  }

  private roundLabel(roundId: string): string {
    const roundNo = this.rounds().find(
      (round) => round.id === roundId
    )?.roundNo;
    return (
      this.translateService.translate('content.round') +
      (roundNo != null ? ' ' + roundNo : '')
    );
  }
}
