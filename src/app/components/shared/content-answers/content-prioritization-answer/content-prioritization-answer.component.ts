import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AnswerWithPoints } from '@arsnova/app/models/answer-with-points';

@Component({
  selector: 'app-content-prioritization-answer',
  templateUrl: './content-prioritization-answer.component.html',
  styleUrls: ['./content-prioritization-answer.component.scss']
})
export class ContentPrioritizationAnswerComponent implements OnInit {

  readonly STEP_SIZE = 10;

  @Input() answerOptions: AnswerWithPoints[];
  @Input() assignablePoints: number;
  @Input() isDisabled: boolean;
  @Output() assignedPoints: EventEmitter<number[]> = new EventEmitter<number[]>();

  pointsLeft: number;

  ngOnInit() {
    this.getAssignedPoints();
  }

  assignPoints(index: number, operation = -1 || 1) {
    this.answerOptions[index].points+= this.STEP_SIZE * operation;
    this.getAssignedPoints();
  }

  getAssignedPoints() {
    this.pointsLeft = this.assignablePoints - this.answerOptions.map(a => a.points).reduce((a, b) => a + b, 0);
    this.assignedPoints.emit(this.answerOptions.map(a => a.points));
  }
}
