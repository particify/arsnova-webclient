import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-multiple-round-selection',
  templateUrl: './multiple-round-selection.component.html',
  styleUrls: ['./multiple-round-selection.component.scss'],
})
export class MultipleRoundSelectionComponent implements OnChanges {
  @Input() standalone = true;
  @Input() round: number;
  @Input() disabled = false;
  @Output() roundChanged: EventEmitter<number> = new EventEmitter<number>();

  currentRound: number;
  rounds = ['1', '2', '1 & 2'];

  ngOnChanges(): void {
    this.currentRound = this.round;
  }

  changeRound(round: number) {
    if (round !== this.currentRound) {
      this.currentRound = round;
      this.roundChanged.emit(this.currentRound);
    }
  }
}
