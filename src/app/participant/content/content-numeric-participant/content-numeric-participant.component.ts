import { Component, Input } from '@angular/core';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { ContentType } from '@app/core/models/content-type.enum';
import { TranslocoService } from '@jsverse/transloco';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { ContentParticipantBaseComponent } from '@app/participant/content/content-participant-base.component';
import { FormService } from '@app/core/services/util/form.service';
import { ContentNumeric } from '@app/core/models/content-numeric';
import { NumericAnswer } from '@app/core/models/numeric-answer';
import { ContentNumericAnswerComponent } from '@app/standalone/content-answers/content-numeric-answer/content-numeric-answer.component';
import { AnswerResultType } from '@app/core/models/answer-result';

@Component({
  selector: 'app-content-numeric-participant',
  templateUrl: './content-numeric-participant.component.html',
  standalone: true,
  imports: [ContentNumericAnswerComponent],
})
export class ContentNumericParticipantComponent extends ContentParticipantBaseComponent {
  @Input({ required: true }) content!: ContentNumeric;
  @Input() answer?: NumericAnswer;
  @Input() correctOptionsPublished = false;

  selectedNumber?: number;

  constructor(
    protected answerService: ContentAnswerService,
    protected notificationService: NotificationService,
    protected translateService: TranslocoService,
    protected route: ActivatedRoute,
    protected globalStorageService: GlobalStorageService,
    protected router: Router,
    protected formService: FormService
  ) {
    super(
      notificationService,
      translateService,
      route,
      globalStorageService,
      router,
      formService
    );
  }

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
