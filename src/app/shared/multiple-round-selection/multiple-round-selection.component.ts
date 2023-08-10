import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-multiple-round-selection',
  templateUrl: './multiple-round-selection.component.html',
  styleUrls: ['./multiple-round-selection.component.scss'],
})
export class MultipleRoundSelectionComponent {
  @Input() round: number;
  @Output() roundChanged: EventEmitter<number> = new EventEmitter<number>();

  rounds = ['1', '2', '1 & 2'];

  changeRound(round: number) {
    if (round !== this.round) {
      this.round = round;
      this.roundChanged.emit(this.round);
    }
  }
}
