import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { Apollo, onlyCompleteData } from 'apollo-angular';
import { updateRoundOn } from '@gql/helper/recover-deleted-round';
import { updatesOnceOpen } from '@app/standalone/content-results/round-updates';
import { CoreModule } from '@app/core/core.module';
import {
  BarListComponent,
  BarListItem,
} from '@app/standalone/content-results/visualization/bar-list/bar-list.component';
import { DataLabelMode } from '@app/standalone/content-results/visualization/data-label';
import {
  PrioritizationContentFormatData,
  QuestionnairePrioritizationRoundStatsByRoundIdGql,
  QuestionnairePrioritizationRoundStatsUpdatedGql,
  Round,
} from '@gql/generated/graphql';

@Component({
  selector: 'app-prioritization-results',
  templateUrl: './prioritization-results.component.html',
  imports: [BarListComponent, CoreModule],
})
export class PrioritizationResultsComponent {
  private readonly apollo = inject(Apollo);
  private readonly roundStatsByRoundId = inject(
    QuestionnairePrioritizationRoundStatsByRoundIdGql
  );
  private readonly roundStatsUpdated = inject(
    QuestionnairePrioritizationRoundStatsUpdatedGql
  );

  readonly roundIds = input.required<string[]>();
  /** Tells which of the rounds are closed. */
  readonly rounds = input<Round[]>([]);
  private readonly rounds$ = toObservable(this.rounds);
  readonly formatData = input.required<PrioritizationContentFormatData>();
  readonly resultsVisible = input(true);
  /**
   * A share of the points distributed, which is what v3 meant by it but never
   * managed to show: its data label formatter summed an argument it was never
   * passed and threw, so no percentage ever appeared. Not a discrepancy.
   */
  readonly visualizationUnitPercent = input(false);

  readonly dataLabelMode = computed<DataLabelMode>(() =>
    this.visualizationUnitPercent() ? 'percent' : 'absolute'
  );

  private readonly roundId = computed(() => this.roundIds()[0]);

  readonly roundStats = toSignal(
    toObservable(this.roundId).pipe(
      switchMap((roundId) => {
        // Nothing to show until the content has a round.
        if (!roundId) {
          return of(undefined);
        }
        return updateRoundOn(
          this.apollo.client,
          this.roundStatsByRoundId.watch({
            variables: { roundId },
            fetchPolicy: 'cache-and-network',
          }),
          updatesOnceOpen(this.rounds$, roundId, () =>
            this.roundStatsUpdated.subscribe({ variables: { roundId } })
          ),
          (r) =>
            r.data && {
              questionnairePrioritizationRoundStatsByRoundId:
                r.data.questionnairePrioritizationRoundStatsUpdated,
            }
        ).pipe(
          onlyCompleteData(),
          map((r) => r.data?.questionnairePrioritizationRoundStatsByRoundId)
        );
      })
    )
  );

  /**
   * Ranked here rather than in the view, so a label can never drift apart from
   * the points it was given.
   */
  readonly items = computed<BarListItem[]>(() => {
    const assignedPoints = this.roundStats()?.assignedPoints ?? [];
    return this.formatData()
      .options.map((option, index) => ({
        label: option.label,
        labelRendered: option.labelRendered,
        value: assignedPoints[index] ?? 0,
      }))
      .sort((a, b) => b.value - a.value);
  });
}
