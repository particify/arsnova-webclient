import { Component, Input } from '@angular/core';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { TextAnswer } from '@app/core/models/text-answer';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { provideTranslocoScope, TranslocoService } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { ContentParticipantBaseComponent } from '@app/participant/content/content-participant-base.component';
import { Content } from '@app/core/models/content';
import { FormService } from '@app/core/services/util/form.service';
import { take } from 'rxjs';
import { ContentTextAnswerComponent } from '@app/standalone/content-answers/content-text-answer/content-text-answer.component';
import { FormsModule } from '@angular/forms';

import { FlexModule } from '@angular/flex-layout';
import { AnswerResultType } from '@app/core/models/answer-result';

@Component({
  selector: 'app-content-text-participant',
  templateUrl: './content-text-participant.component.html',
  styleUrls: ['./content-text-participant.component.scss'],
  imports: [FlexModule, FormsModule, ContentTextAnswerComponent],
  providers: [provideTranslocoScope('participant')],
})
export class ContentTextParticipantComponent extends ContentParticipantBaseComponent {
  @Input({ required: true }) content!: Content;
  @Input() answer?: TextAnswer;

  textAnswer = '';

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

  submitAnswer() {
    if (this.textAnswer.trim().valueOf() === '') {
      this.translateService
        .selectTranslate('participant.answer.please-answer')
        .pipe(take(1))
        .subscribe((message) => {
          this.notificationService.showAdvanced(
            message,
            AdvancedSnackBarTypes.WARNING
          );
        });
      this.textAnswer = '';
      return;
    }
    this.disableForm();
    const answer = new TextAnswer(
      this.content.id,
      this.content.state.round,
      this.textAnswer
    );
    this.answerService.addAnswerText(this.content.roomId, answer).subscribe(
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
    const answer = new TextAnswer(this.content.id, this.content.state.round);
    this.answerService.addAnswerText(this.content.roomId, answer).subscribe(
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
