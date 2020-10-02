import { Component, OnInit, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AnswerOption } from '@arsnova/app/models/answer-option';

@Component({
  selector: 'app-content-sort-answer',
  templateUrl: './content-sort-answer.component.html',
  styleUrls: ['./content-sort-answer.component.scss']
})
export class ContentSortAnswerComponent implements OnInit {

  @Input() answerOptions: AnswerOption[];
  @Input() disabled: boolean;

  constructor() {
  }

  ngOnInit(): void {
  }

  drop(event: CdkDragDrop<String[]>) {
    moveItemInArray(this.answerOptions, event.previousIndex, event.currentIndex);
  }
}
