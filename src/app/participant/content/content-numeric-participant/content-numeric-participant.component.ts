import { Component, Input, inject } from '@angular/core';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { AdvancedSnackBarTypes } from '@app/core/services/util/notification.service';
import { ContentType } from '@app/core/models/content-type.enum';
import { provideTranslocoScope } from '@jsverse/transloco';
import { ContentParticipantBaseComponent } from '@app/participant/content/content-participant-base.component';
import { ContentNumeric } from '@app/core/models/content-numeric';
import { NumericAnswer } from '@app/core/models/numeric-answer';
import { ContentNumericAnswerComponent } from '@app/standalone/content-answers/content-numeric-answer/content-numeric-answer.component';
import { AnswerResultType } from '@app/core/models/answer-result';

@Component({
  selector: 'app-content-numeric-participant',
  templateUrl: './content-numeric-participant.component.html',
  imports: [ContentNumericAnswerComponent],
  providers: [provideTranslocoScope('participant')],
})
export class ContentNumericParticipantComponent extends ContentParticipantBaseComponent {
  protected answerService = inject(ContentAnswerService);

  @Input({ required: true }) content!: ContentNumeric;
  @Input() answer?: NumericAnswer;
  @Input() correctOptionsPublished = false;

  selectedNumber?: number;

  init() {
    if (this.answer) {
      this.selectedNumber = this.answer.selectedNumber;
    }
  }

  submitAnswer(): void {
    if (this.selectedNumber === undefined) {
      const msg = this.translateService.translate(
        'participant.answer.please-answer'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return;
    }
    if (
      this.selectedNumber < this.content.minNumber ||
      this.selectedNumber > this.content.maxNumber
    ) {
      const msg = this.translateService.translate(
        'participant.answer.please-select-number-from-range'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return;
    }
    this.disableForm();
    const answer = new NumericAnswer(
      this.content.id,
      this.content.state.round,
      ContentType.NUMERIC
    );
    answer.selectedNumber = this.selectedNumber;
    this.answerService.addAnswerNumeric(this.content.roomId, answer).subscribe(
      (answer) => {
        this.answer = answer;
        const msg = this.translateService.translate('participant.answer.sent');
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
        this.sendStatusToParent(this.getAnswerResultType());
      },
      () => {
        this.enableForm();
      }
    );
  }

  abstain() {
    const answer = new NumericAnswer(
      this.content.id,
      this.content.state.round,
      ContentType.NUMERIC
    );
    this.answerService.addAnswerNumeric(this.content.roomId, answer).subscribe(
      () => {
        this.selectedNumber = undefined;
        this.sendStatusToParent(AnswerResultType.ABSTAINED);
      },
      () => {
        this.enableForm();
      }
    );
  }

  private getAnswerResultType(): AnswerResultType {
    if (
      this.content.correctNumber === undefined ||
      !this.correctOptionsPublished
    ) {
      return AnswerResultType.NEUTRAL;
    } else {
      return this.selectedNumber !== undefined &&
        this.selectedNumber >=
          this.content.correctNumber - this.content.tolerance &&
        this.selectedNumber <=
          this.content.correctNumber + this.content.tolerance
        ? AnswerResultType.CORRECT
        : AnswerResultType.WRONG;
    }
  }
}
