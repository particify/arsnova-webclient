import { Component, Input } from '@angular/core';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { provideTranslocoScope, TranslocoService } from '@jsverse/transloco';
import { ContentType } from '@app/core/models/content-type.enum';
import { Router } from '@angular/router';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { ContentParticipantBaseComponent } from '@app/participant/content/content-participant-base.component';
import { MultipleTextsAnswer } from '@app/core/models/multiple-texts-answer';
import { ContentWordcloud } from '@app/core/models/content-wordcloud';
import { FormService } from '@app/core/services/util/form.service';
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
  @Input({ required: true }) content!: ContentWordcloud;
  @Input() answer?: MultipleTextsAnswer;

  words: string[] = [];

  constructor(
    protected answerService: ContentAnswerService,
    protected notificationService: NotificationService,
    protected translateService: TranslocoService,
    protected globalStorageService: GlobalStorageService,
    protected router: Router,
    protected formService: FormService
  ) {
    super(
      notificationService,
      translateService,
      globalStorageService,
      router,
      formService
    );
  }

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
