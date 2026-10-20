import { Component, input, model } from '@angular/core';
import { CoreModule } from '@app/core/core.module';

@Component({
  selector: 'app-content-wordcloud-answer',
  imports: [CoreModule],
  templateUrl: './content-wordcloud-answer.component.html',
  styleUrls: ['./content-wordcloud-answer.component.scss'],
})
export class ContentWordcloudAnswerComponent {
  readonly maxLength = 25;

  words = model<string[]>([]);
  disabled = input(false);

  currentInputIndex?: number;
}
