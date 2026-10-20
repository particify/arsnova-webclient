import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  combineLatest,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  take,
} from 'rxjs';
import { Apollo, onlyCompleteData } from 'apollo-angular';
import { updateRoundOn } from '@gql/helper/recover-deleted-round';
import { updatesOnceOpen } from '@app/standalone/content-results/round-updates';
import { TranslocoService } from '@jsverse/transloco';
import {
  QuestionnaireScaleRoundStatsByRoundIdGql,
  QuestionnaireScaleRoundStatsUpdatedGql,
  Round,
  ScaleContentFormatData,
  ScaleContentRoundStats,
} from '@gql/generated/graphql';
import { CoreModule } from '@app/core/core.module';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { LanguageService } from '@app/core/services/util/language.service';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { BarChartComponent } from '@app/standalone/content-results/visualization/chart/bar-chart.component';

const NEUTRAL_COLOR_INDEX = 2;

@Component({
  selector: 'app-scale-results',
  templateUrl: './scale-results.component.html',
  imports: [CoreModule, BarChartComponent],
})
export class ScaleResultsComponent {
  private readonly apollo = inject(Apollo);
  private readonly themeService = inject(ThemeService);
  private readonly presentationService = inject(PresentationService);
  private readonly translateService = inject(TranslocoService);
  private readonly languageService = inject(LanguageService);
  private readonly likertScaleService = inject(LikertScaleService);
  private readonly roundStatsByRoundId = inject(
    QuestionnaireScaleRoundStatsByRoundIdGql
  );
  private readonly scaleRoundStatsUpdated = inject(
    QuestionnaireScaleRoundStatsUpdatedGql
  );

  readonly roundIds = input.required<string[]>();
  readonly rounds = input.required<Round[]>();
  private readonly rounds$ = toObservable(this.rounds);
  readonly formatData = input.required<ScaleContentFormatData>();
  readonly resultsVisible = input(true);
  readonly visualizationUnitPercent = input(false);
  readonly isPresentation = input(false);
  readonly language = input<string>();

  readonly scale = computed(() =>
    this.isPresentation() ? this.presentationService.scale() : 1
  );

  private statsForRound(
    roundId: string
  ): Observable<ScaleContentRoundStats | null | undefined> {
    return updateRoundOn(
      this.apollo.client,
      this.roundStatsByRoundId.watch({
        variables: { roundId },
        fetchPolicy: 'cache-and-network',
      }),
      updatesOnceOpen(this.rounds$, roundId, () =>
        this.scaleRoundStatsUpdated.subscribe({ variables: { roundId } })
      ),
      (r) =>
        r.data && {
          questionnaireScaleRoundStatsByRoundId:
            r.data.questionnaireScaleRoundStatsUpdated,
        }
    ).pipe(
      onlyCompleteData(),
      map((r) => r.data?.questionnaireScaleRoundStatsByRoundId)
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

  private readonly options = computed(() =>
    this.likertScaleService.getOptions(
      this.formatData().template,
      this.formatData().neutralOption
    )
  );

  readonly optionCount = computed(() => this.options().labels.length);

  /**
   * The room's language where it has translations, else the active one. That
   * language may not be loaded yet, hence `selectTranslate`.
   */
  readonly labels = toSignal(
    toObservable(
      computed(() => ({
        options: this.options(),
        lang: this.languageService.ensureValidLang(this.language()),
      }))
    ).pipe(
      switchMap(({ options, lang }) =>
        options.translate && options.labels.length
          ? forkJoin(
              options.labels.map((label) =>
                this.translateService
                  .selectTranslate<string>(label, undefined, lang)
                  .pipe(take(1))
              )
            )
          : of(options.labels)
      )
    ),
    { initialValue: [] as string[] }
  );

  /** Colours line up with the options, so four of them drop the middle one. */
  private readonly barColors = computed(() => {
    const colors = this.themeService.getLikertColors();
    if (!this.formatData().neutralOption) {
      colors.splice(NEUTRAL_COLOR_INDEX, 1);
    }
    return colors;
  });

  readonly visualizationData = computed(() => {
    const stats = this.roundStatsList() ?? [];
    const barColors = this.barColors();
    // Off the options, not the labels, which resolve asynchronously.
    const optionCount = this.optionCount();
    return {
      labels: this.labels(),
      datasets: this.roundIds().map((roundId, i) => ({
        values: Array.from(
          { length: optionCount },
          (_, index) => stats[i]?.counts?.[index] ?? 0
        ),
        colors: barColors,
        label: this.comparingRounds() ? this.roundLabel(roundId) : undefined,
      })),
    };
  });

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
