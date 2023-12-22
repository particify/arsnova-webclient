import { Component, Input } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { MultipleTextsAnswer } from '@app/core/models/multiple-texts-answer';

@Component({
  selector: 'app-content-wordcloud-answer',
  standalone: true,
  imports: [CoreModule],
  templateUrl: './content-wordcloud-answer.component.html',
  styleUrls: ['./content-wordcloud-answer.component.scss'],
})
export class ContentWordcloudAnswerComponent {
  readonly maxLength = 25;

  @Input({ required: true }) words!: string[];
  @Input() givenAnswer?: MultipleTextsAnswer;
  @Input() disabled = false;
  currentInputIndex?: number;

  trackByIndex(index: number) {
    return index;
  }
}
