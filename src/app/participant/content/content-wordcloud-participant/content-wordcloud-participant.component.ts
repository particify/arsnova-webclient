import { Component, Input, inject } from '@angular/core';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { AdvancedSnackBarTypes } from '@app/core/services/util/notification.service';
import { provideTranslocoScope } from '@jsverse/transloco';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentParticipantBaseComponent } from '@app/participant/content/content-participant-base.component';
import { MultipleTextsAnswer } from '@app/core/models/multiple-texts-answer';
import { ContentWordcloud } from '@app/core/models/content-wordcloud';
import { take } from 'rxjs';
import { ContentWordcloudAnswerComponent } from '@app/standalone/content-answers/content-wordcloud-answer/content-wordcloud-answer.component';
import { AnswerResultType } from '@app/core/models/answer-result';

@Component({
  selector: 'app-content-wordcloud-participant',
  templateUrl: './content-wordcloud-participant.component.html',
  imports: [ContentWordcloudAnswerComponent],
  providers: [provideTranslocoScope('participant')],
})
export class ContentWordcloudParticipantComponent extends ContentParticipantBaseComponent {
  protected answerService = inject(ContentAnswerService);

  @Input({ required: true }) content!: ContentWordcloud;
  @Input() answer?: MultipleTextsAnswer;

  words: string[] = [];

  init() {
    if (this.answer) {
      this.words = this.answer.texts;
    } else {
      this.words = new Array<string>(this.content.maxAnswers).fill('');
    }
    this.isLoading = false;
  }

  submitAnswer() {
    const words = this.words.filter((w) => w);
    if (words.length === 0) {
      this.translateService
        .selectTranslate('participant.answer.please-answer')
        .pipe(take(1))
        .subscribe((message) => {
          this.notificationService.showAdvanced(
            message,
            AdvancedSnackBarTypes.WARNING
          );
        });
      return;
    }
    this.disableForm();
    const answer = new MultipleTextsAnswer(
      this.content.id,
      this.content.state.round,
      ContentType.WORDCLOUD
    );
    answer.texts = words;
    this.answerService.addAnswer(this.content.roomId, answer).subscribe(
      (answer) => {
        this.answer = answer;
        this.translateService
          .selectTranslate('participant.answer.sent')
          .pipe(take(1))
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
          });
        this.sendStatusToParent(AnswerResultType.NEUTRAL);
      },
      () => {
        this.enableForm();
      }
    );
  }

  abstain() {
    this.words = [];
    const answer = new MultipleTextsAnswer(
      this.content.id,
      this.content.state.round,
      ContentType.WORDCLOUD
    );
    this.answerService.addAnswer(this.content.roomId, answer).subscribe(
      (answer) => {
        this.answer = answer;
        this.sendStatusToParent(AnswerResultType.ABSTAINED);
      },
      () => {
        this.enableForm();
      }
    );
  }
}
