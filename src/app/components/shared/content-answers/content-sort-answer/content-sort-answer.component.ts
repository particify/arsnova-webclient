import { Component, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AnswerOption } from '@arsnova/app/models/answer-option';

@Component({
  selector: 'app-content-sort-answer',
  templateUrl: './content-sort-answer.component.html',
  styleUrls: ['./content-sort-answer.component.scss']
})
export class ContentSortAnswerComponent {

  @Input() answerOptions: AnswerOption[];
  @Input() disabled: boolean;

  constructor() {
  }

  drop(event: CdkDragDrop<String[]>) {
    moveItemInArray(this.answerOptions, event.previousIndex, event.currentIndex);
  }
}
