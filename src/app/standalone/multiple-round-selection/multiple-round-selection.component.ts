import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { NgClass } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatButton } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout';

@Component({
  selector: 'app-multiple-round-selection',
  templateUrl: './multiple-round-selection.component.html',
  styleUrls: ['./multiple-round-selection.component.scss'],
  standalone: true,
  imports: [
    FlexModule,
    MatButton,
    MatMenuTrigger,
    MatTooltip,
    NgClass,
    MatMenu,
    MatMenuItem,
    TranslocoPipe,
  ],
})
export class MultipleRoundSelectionComponent {
  @Input({ required: true }) round!: number;
  @Output() roundChanged: EventEmitter<number> = new EventEmitter<number>();

  rounds = ['1', '2', '1 & 2'];

  changeRound(round: number) {
    if (round !== this.round) {
      this.round = round;
      this.roundChanged.emit(this.round);
    }
  }
}
