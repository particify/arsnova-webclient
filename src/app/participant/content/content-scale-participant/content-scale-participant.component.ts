import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { ChoiceAnswer } from '@app/core/models/choice-answer';
import { ContentScale } from '@app/core/models/content-scale';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { ContentParticipantBaseComponent } from '@app/participant/content/content-participant-base.component';
import { AnswerOption } from '@app/core/models/answer-option';
import { SelectableAnswer } from '@app/core/models/selectable-answer';
import { FormService } from '@app/core/services/util/form.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-content-scale-participant',
  templateUrl: './content-scale-participant.component.html',
})
export class ContentScaleParticipantComponent extends ContentParticipantBaseComponent {
  @Input() content: ContentScale;
  @Input() answer: ChoiceAnswer;
  @Input() statsPublished: boolean;
  @Output() answerChanged = new EventEmitter<ChoiceAnswer>();

  selectableAnswers: SelectableAnswer[] = [];
  hasAbstained = false;
  selectedAnswerIndex: number;

  constructor(
    protected answerService: ContentAnswerService,
    protected notificationService: NotificationService,
    protected translateService: TranslocoService,
    protected route: ActivatedRoute,
    protected globalStorageService: GlobalStorageService,
    protected router: Router,
    private likertScaleService: LikertScaleService,
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
    const optionLabels = this.likertScaleService.getOptionLabels(
      this.content.optionTemplate,
      this.content.optionCount
    );
    if (optionLabels) {
      this.selectableAnswers = optionLabels.map(
        (label) => new SelectableAnswer(new AnswerOption(label), false)
      );
    }
    if (this.answer) {
      if (this.answer.selectedChoiceIndexes?.length > 0) {
        this.selectedAnswerIndex = this.answer.selectedChoiceIndexes[0];
      } else {
        this.hasAbstained = true;
      }
    }
    this.isLoading = false;
  }

  setAnswer(index: number) {
    this.selectedAnswerIndex = index;
  }

  submitAnswer(): void {
    if (this.selectedAnswerIndex === undefined) {
      this.translateService
        .selectTranslate('answer.please-one')
        .subscribe((message) => {
          this.notificationService.showAdvanced(
            message,
            AdvancedSnackBarTypes.WARNING
          );
        });
      return;
    }
    this.disableForm();
    const answer = new ChoiceAnswer();
    answer.contentId = this.content.id;
    answer.round = this.content.state.round;
    answer.selectedChoiceIndexes = [this.selectedAnswerIndex];
    answer.format = ContentType.SCALE;
    this.answerService.addAnswerChoice(this.content.roomId, answer).subscribe(
      (answer) => {
        this.answer = answer;
        this.translateService
          .selectTranslate('answer.sent')
          .pipe(take(1))
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
          });
        this.sendStatusToParent(answer);
      },
      () => {
        this.enableForm();
      }
    );
  }

  abstain() {
    const answer = new ChoiceAnswer();
    answer.contentId = this.content.id;
    answer.round = this.content.state.round;
    answer.format = ContentType.SCALE;
    this.answerService
      .addAnswerChoice(this.content.roomId, answer)
      .subscribe((answer) => {
        this.hasAbstained = true;
        this.sendStatusToParent(answer);
      }),
      () => {
        this.enableForm();
      };
  }
}
