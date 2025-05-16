import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { AnswerOption } from '@app/core/models/answer-option';
import { AnnounceService } from '@app/core/services/util/announce.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { DisplayAnswer } from '@app/creator/content-group/content-editing/_models/display-answer';
import { FormComponent } from '@app/standalone/form/form.component';
import { TranslocoService } from '@jsverse/transloco';

const MAX_ANSWER_OPTIONS = 12;

@Component({
  selector: 'app-create-answer-option',
  templateUrl: './create-answer-option.component.html',
  styleUrls: ['./create-answer-option.component.scss'],
  standalone: false,
})
export class CreateAnswerOptionComponent extends FormComponent {
  private translateService = inject(TranslocoService);
  private notificationService = inject(NotificationService);
  private announceService = inject(AnnounceService);

  @ViewChild('answerInput') answerInput!: ElementRef;

  @Input({ required: true }) answers!: DisplayAnswer[];
  @Input() lengthLimit = 500;

  newAnswer = '';

  createAnswer() {
    if (this.newAnswer === '') {
      const msg = this.translateService.translate(
        'creator.content.no-empty-fields-allowed'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.FAILED);
      return;
    }
    if (this.answerExists()) {
      return;
    }
    if (this.answers.length < MAX_ANSWER_OPTIONS) {
      this.answers.push(
        new DisplayAnswer(new AnswerOption(this.newAnswer), false)
      );
      this.announceService.announce('creator.content.a11y-answer-added');
      this.newAnswer = '';
      this.answerInput.nativeElement.focus();
    } else {
      const msg = this.translateService.translate(
        'creator.content.max-answers',
        { max: MAX_ANSWER_OPTIONS }
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.FAILED);
    }
  }

  isFormValid(): boolean {
    if (this.newAnswer.length > 0) {
      const msg = this.translateService.translate(
        'creator.content.unsaved-answer'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return false;
    } else {
      return true;
    }
  }

  private answerExists(): boolean {
    if (
      this.answers.map((o) => o.answerOption.label).indexOf(this.newAnswer) >= 0
    ) {
      const msg = this.translateService.translate(
        'creator.content.same-answer'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return true;
    } else {
      return false;
    }
  }
}
