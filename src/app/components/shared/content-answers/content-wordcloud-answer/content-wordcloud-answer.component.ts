import { Component, Input } from '@angular/core';
import { MultipleTextsAnswer } from '@arsnova/app/models/multiple-texts-answer';

@Component({
  selector: 'app-content-wordcloud-answer',
  templateUrl: './content-wordcloud-answer.component.html',
  styleUrls: ['./content-wordcloud-answer.component.scss']
})
export class ContentWordcloudAnswerComponent {

  readonly maxLength = 25;

  @Input() words: string[] = [];
  @Input() givenAnswer: MultipleTextsAnswer;
  currentInputIndex: number;

  constructor() { }

  trackByIndex(index: number) {
    return index;
  }
}
