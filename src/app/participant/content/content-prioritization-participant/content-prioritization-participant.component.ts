import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnswerWithPoints } from '@core/models/answer-with-points';
import { ContentType } from '@core/models/content-type.enum';
import { PrioritizationAnswer } from '@core/models/prioritization-answer';
import { ContentAnswerService } from '@core/services/http/content-answer.service';
import { GlobalStorageService } from '@core/services/util/global-storage.service';
import { LanguageService } from '@core/services/util/language.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@core/services/util/notification.service';
import { ContentPrioritization } from '@core/models/content-prioritization';
import { TranslateService } from '@ngx-translate/core';
import { ContentParticipantBaseComponent } from '@participant/content/content-participant-base.component';

@Component({
  selector: 'app-content-prioritization-participant',
  templateUrl: './content-prioritization-participant.component.html',
})
export class ContentPrioritizationParticipantComponent extends ContentParticipantBaseComponent {
  @Input() content: ContentPrioritization;
  @Input() answer: PrioritizationAnswer;
  @Input() alreadySent: boolean;
  @Input() sendEvent: EventEmitter<string>;
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
    protected langService: LanguageService,
    protected route: ActivatedRoute,
    protected globalStorageService: GlobalStorageService,
    protected router: Router
  ) {
    super(
      notificationService,
      translateService,
      langService,
      route,
      globalStorageService,
      router
    );
  }

  init() {
    if (this.alreadySent) {
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
      .subscribe((answer) => {
        this.answer = answer;
        this.translateService.get('answer.sent').subscribe((msg) => {
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
        });
        this.sendStatusToParent(answer);
      });
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
      });
  }
}
