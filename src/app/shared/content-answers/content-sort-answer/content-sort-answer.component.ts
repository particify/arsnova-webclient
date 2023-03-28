import { Component, Input, OnInit } from '@angular/core';
import { AnswerOption } from '@core/models/answer-option';
import { DragDropBaseComponent } from '@shared/drag-drop-base/drag-drop-base.component';
@Component({
  selector: 'app-content-sort-answer',
  templateUrl: './content-sort-answer.component.html',
  styleUrls: ['./content-sort-answer.component.scss'],
})
export class ContentSortAnswerComponent
  extends DragDropBaseComponent
  implements OnInit
{
  @Input() answerOptions: AnswerOption[];
  @Input() disabled: boolean;
  @Input() dynamicRendering: boolean;

  constructor() {
    super();
  }
  ngOnInit(): void {
    this.dragDroplist = this.answerOptions;
  }
}
