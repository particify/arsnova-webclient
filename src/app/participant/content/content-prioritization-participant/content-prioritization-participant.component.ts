import { Component, Input, inject } from '@angular/core';
import { AnswerWithPoints } from '@app/core/models/answer-with-points';
import { ContentType } from '@app/core/models/content-type.enum';
import { PrioritizationAnswer } from '@app/core/models/prioritization-answer';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { AdvancedSnackBarTypes } from '@app/core/services/util/notification.service';
import { ContentPrioritization } from '@app/core/models/content-prioritization';
import { provideTranslocoScope } from '@jsverse/transloco';
import { ContentParticipantBaseComponent } from '@app/participant/content/content-participant-base.component';
import { take } from 'rxjs';
import { ContentPrioritizationAnswerComponent } from '@app/standalone/content-answers/content-prioritization-answer/content-prioritization-answer.component';
import { AnswerResultType } from '@app/core/models/answer-result';

@Component({
  selector: 'app-content-prioritization-participant',
  templateUrl: './content-prioritization-participant.component.html',
  imports: [ContentPrioritizationAnswerComponent],
  providers: [provideTranslocoScope('participant')],
})
export class ContentPrioritizationParticipantComponent extends ContentParticipantBaseComponent {
  protected answerService = inject(ContentAnswerService);

  @Input({ required: true }) content!: ContentPrioritization;
  @Input() answer?: PrioritizationAnswer;

  isLoading = true;
  hasAbstained = false;
  isCorrect = false;
  answerOptions: AnswerWithPoints[] = [];
  assignedPoints: number[] = [];

  init() {
    if (this.isDisabled) {
      this.hasAbstained = !this.answer?.assignedPoints;
    }
    this.initAnswers();
  }

  initAnswers() {
    const assignedPoints = this.answer?.assignedPoints;
    this.content.options.forEach((option, index) => {
      const points = assignedPoints ? assignedPoints[index] : 0;
      this.answerOptions.push(new AnswerWithPoints(option, points));
    });
    this.isLoading = false;
  }

  setAssignedPoints(assignedPoints: number[]) {
    this.assignedPoints = assignedPoints;
  }

  isPointSumCorrect(): boolean {
    return (
      this.assignedPoints.reduce((a, b) => a + b, 0) ===
      this.content.assignablePoints
    );
  }

  arePointsInRange(): boolean {
    return this.assignedPoints.every(
      (points) => points >= 0 && points <= this.content.assignablePoints
    );
  }

  submitAnswer() {
    if (!this.isPointSumCorrect()) {
      const msg = this.translateService.translate(
        'participant.answer.please-assign-points-correctly',
        { points: this.content.assignablePoints }
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return;
    } else if (!this.arePointsInRange()) {
      const msg = this.translateService.translate(
        'participant.answer.please-assign-valid-points',
        { points: this.content.assignablePoints }
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return;
    }
    this.disableForm();
    const answer = new PrioritizationAnswer(
      this.content.id,
      this.content.state.round,
      ContentType.PRIORITIZATION
    );
    answer.assignedPoints = this.assignedPoints;
    this.answerService
      .addAnswerPrioritization(this.content.roomId, answer)
      .subscribe(
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
    const answer = new PrioritizationAnswer(
      this.content.id,
      this.content.state.round,
      ContentType.PRIORITIZATION
    );
    this.answerService
      .addAnswerPrioritization(this.content.roomId, answer)
      .subscribe(
        () => {
          this.hasAbstained = true;
          this.sendStatusToParent(AnswerResultType.ABSTAINED);
        },
        () => {
          this.enableForm();
        }
      );
  }
}
