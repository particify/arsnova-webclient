import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { AnswerWithPoints } from '@app/core/models/answer-with-points';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';

@Component({
  selector: 'app-content-prioritization-answer',
  imports: [CoreModule, RenderedTextComponent],
  templateUrl: './content-prioritization-answer.component.html',
  styleUrls: ['./content-prioritization-answer.component.scss'],
})
export class ContentPrioritizationAnswerComponent implements OnInit {
  readonly STEP_SIZE = 10;

  @Input({ required: true }) answerOptions!: AnswerWithPoints[];
  @Input({ required: true }) assignablePoints!: number;
  @Input() isDisabled = false;
  @Output() assignedPoints: EventEmitter<number[]> = new EventEmitter<
    number[]
  >();

  pointsLeft!: number;

  ngOnInit() {
    this.getAssignedPoints();
  }

  assignPoints(index: number, operation: -1 | 1) {
    this.answerOptions[index].points += this.STEP_SIZE * operation;
    this.getAssignedPoints();
  }

  getAssignedPoints() {
    this.pointsLeft =
      this.assignablePoints -
      this.answerOptions.map((a) => a.points).reduce((a, b) => a + b, 0);
    this.assignedPoints.emit(this.answerOptions.map((a) => a.points));
  }
}
