import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, merge, share, switchMap, takeUntil } from 'rxjs';
import { onlyCompleteData } from 'apollo-angular';
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
} from '@gql/generated/graphql';

@Component({
  selector: 'app-prioritization-results',
  templateUrl: './prioritization-results.component.html',
  imports: [BarListComponent, CoreModule],
})
export class PrioritizationResultsComponent {
  private readonly roundStatsByRoundId = inject(
    QuestionnairePrioritizationRoundStatsByRoundIdGql
  );
  private readonly roundStatsUpdated = inject(
    QuestionnairePrioritizationRoundStatsUpdatedGql
  );

  readonly roundIds = input.required<string[]>();
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
        const initial$ = this.roundStatsByRoundId
          .watch({ variables: { roundId } })
          .valueChanges.pipe(
            onlyCompleteData(),
            map((r) => r.data?.questionnairePrioritizationRoundStatsByRoundId)
          );

        const updates$ = this.roundStatsUpdated
          .subscribe({ variables: { roundId } })
          .pipe(
            map((r) => r.data?.questionnairePrioritizationRoundStatsUpdated),
            share()
          );
        return merge(initial$.pipe(takeUntil(updates$)), updates$);
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
