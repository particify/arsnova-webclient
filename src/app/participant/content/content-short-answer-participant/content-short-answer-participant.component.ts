import { Component, Input, inject } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { AnswerResultType } from '@app/core/models/answer-result';
import { Content } from '@app/core/models/content';
import { ShortAnswerAnswer } from '@app/core/models/short-answer-answer';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { ContentService } from '@app/core/services/http/content.service';
import { AdvancedSnackBarTypes } from '@app/core/services/util/notification.service';
import { ContentParticipantBaseComponent } from '@app/participant/content/content-participant-base.component';
import { ContentTextAnswerComponent } from '@app/standalone/content-answers/content-text-answer/content-text-answer.component';
import { provideTranslocoScope, TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-content-short-answer-participant',
  imports: [FlexModule, FormsModule, ContentTextAnswerComponent, TranslocoPipe],
  templateUrl: './content-short-answer-participant.component.html',
  styleUrl: './content-short-answer-participant.component.scss',
  providers: [provideTranslocoScope('participant')],
})
export class ContentShortAnswerParticipantComponent extends ContentParticipantBaseComponent {
  protected answerService = inject(ContentAnswerService);
  private contentService = inject(ContentService);

  @Input({ required: true }) content!: Content;
  @Input() answer?: ShortAnswerAnswer;
  @Input() correctOptionsPublished = false;
  @Input() isCorrect?: boolean;

  correctTerms?: string[];

  textAnswer = '';

  init() {
    if (this.answer && this.correctOptionsPublished) {
      this.contentService
        .getCorrectTerms(this.content.roomId, this.content.id)
        .subscribe((terms) => {
          this.correctTerms = terms;
          this.isLoading = false;
        });
    } else {
      this.isLoading = false;
    }
  }

  submitAnswer() {
    if (this.textAnswer.trim().valueOf() === '') {
      const msg = this.translateService.translate(
        'participant.answer.please-answer'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      this.textAnswer = '';
      return;
    }
    this.disableForm();
    const answer = new ShortAnswerAnswer(
      this.content.id,
      this.content.state.round,
      this.textAnswer
    );
    this.answerService
      .addAnswerAndCheckResult<
        ShortAnswerAnswer,
        string[]
      >(this.content.roomId, answer)
      .subscribe({
        next: (answerResponse) => {
          this.answer = answerResponse.answer;
          this.correctTerms = answerResponse.correctnessCriteria;
          const state = answerResponse.answerResult.state;
          this.isCorrect = state === AnswerResultType.CORRECT;
          this.sendStatusToParent(
            this.correctOptionsPublished ? state : AnswerResultType.NEUTRAL
          );
          const msg = this.translateService.translate(
            'participant.answer.sent'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
        },
        error: () => {
          this.enableForm();
        },
      });
  }

  abstain() {
    const answer = new ShortAnswerAnswer(
      this.content.id,
      this.content.state.round
    );
    this.answerService.addAnswerText(this.content.roomId, answer).subscribe({
      next: (answer) => {
        this.answer = answer;
        this.sendStatusToParent(AnswerResultType.ABSTAINED);
      },
      error: () => {
        this.enableForm();
      },
    });
  }
}
