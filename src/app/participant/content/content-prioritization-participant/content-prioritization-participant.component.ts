import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnswerWithPoints } from '@app/core/models/answer-with-points';
import { ContentType } from '@app/core/models/content-type.enum';
import { PrioritizationAnswer } from '@app/core/models/prioritization-answer';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { ContentPrioritization } from '@app/core/models/content-prioritization';
import { TranslateService } from '@ngx-translate/core';
import { ContentParticipantBaseComponent } from '@app/participant/content/content-participant-base.component';
import { FormService } from '@app/core/services/util/form.service';

@Component({
  selector: 'app-content-prioritization-participant',
  templateUrl: './content-prioritization-participant.component.html',
})
export class ContentPrioritizationParticipantComponent extends ContentParticipantBaseComponent {
  @Input() content: ContentPrioritization;
  @Input() answer: PrioritizationAnswer;
  @Output() answerChanged = new EventEmitter<PrioritizationAnswer>();

  isLoading = true;
  hasAbstained = false;
  isCorrect = false;
  correctOptionIndexes: number[];
  answerOptions: AnswerWithPoints[] = [];
  assignedPoints: number[] = [];

  constructor(
    protected answerService: ContentAnswerService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
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
    if (this.isDisabled) {
      this.hasAbstained = !this.answer.assignedPoints;
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
      const msg = this.translateService.instant(
        'answer.please-assign-points-correctly',
        { points: this.content.assignablePoints }
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return;
    } else if (!this.arePointsInRange()) {
      const msg = this.translateService.instant(
        'answer.please-assign-valid-points',
        { points: this.content.assignablePoints }
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return;
    }
    this.disableForm();
    this.answerService
      .addAnswerPrioritization(this.content.roomId, {
        id: null,
        revision: null,
        contentId: this.content.id,
        round: this.content.state.round,
        assignedPoints: this.assignedPoints,
        creationTimestamp: null,
        format: ContentType.PRIORITIZATION,
      } as PrioritizationAnswer)
      .subscribe(
        (answer) => {
          this.answer = answer;
          this.translateService.get('answer.sent').subscribe((msg) => {
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
    this.answerService
      .addAnswerPrioritization(this.content.roomId, {
        id: null,
        revision: null,
        contentId: this.content.id,
        round: this.content.state.round,
        assignedPoints: [],
        creationTimestamp: null,
        format: ContentType.PRIORITIZATION,
      } as PrioritizationAnswer)
      .subscribe((answer) => {
        this.hasAbstained = true;
        this.sendStatusToParent(answer);
      }),
      () => {
        this.enableForm();
      };
  }
}
