import { Component, computed, input, model } from '@angular/core';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { Round } from '@gql/generated/graphql';
import { sortedRoundNumbers, toggleRoundSelection } from './round-selection';

@Component({
  selector: 'app-round-selector',
  templateUrl: './round-selector.component.html',
  styleUrl: './round-selector.component.scss',
  imports: [
    MatFabButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatTooltip,
    NgClass,
    TranslocoPipe,
  ],
})
export class RoundSelectorComponent {
  rounds = input.required<Round[]>();
  selectedRoundIds = model.required<string[]>();
  allowComparison = input(true);

  private readonly selectedRoundNumbers = computed(() =>
    sortedRoundNumbers(this.rounds(), this.selectedRoundIds())
  );

  readonly roundsLabel = computed(() =>
    this.selectedRoundNumbers().join(' & ')
  );

  readonly translationKey = computed(
    () =>
      'content.round' +
      (this.selectedRoundNumbers().length > 1 ? 's-' : '-') +
      'displayed'
  );

  isSelected(roundId: string): boolean {
    return this.selectedRoundIds().includes(roundId);
  }

  toggleRound(roundId: string) {
    this.selectedRoundIds.set(
      toggleRoundSelection(
        this.selectedRoundIds(),
        roundId,
        this.allowComparison()
      )
    );
  }
}
