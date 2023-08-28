import { Component, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentService } from '@app/core/services/http/content.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { AnswerOption } from '@app/core/models/answer-option';
import { AdvancedSnackBarTypes } from '@app/core/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import {
  ContentCreationComponent,
  DisplayAnswer,
} from '@app/creator/content-creation/content-creation/content-creation.component';
import { ContentPrioritization } from '@app/core/models/content-prioritization';
import { PrioritizationRoundStatistics } from '@app/core/models/round-statistics';
import { FormService } from '@app/core/services/util/form.service';

@Component({
  selector: 'app-content-prioritization-creation',
  templateUrl: './content-prioritization-creation.component.html',
  styleUrls: ['./content-prioritization-creation.component.scss'],
})
export class ContentPrioritizationCreationComponent
  extends ContentCreationComponent
  implements OnInit
{
  isAnswerEdit = -1;
  resetAnswerInputEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    protected contentService: ContentService,
    protected notificationService: NotificationService,
    protected translationService: TranslateService,
    protected route: ActivatedRoute,
    protected contentGroupService: ContentGroupService,
    protected announceService: AnnounceService,
    protected formService: FormService
  ) {
    super(
      contentService,
      notificationService,
      translationService,
      route,
      contentGroupService,
      announceService,
      formService
    );
  }

  initContentCreation() {
    this.content = new ContentPrioritization(
      null,
      null,
      '',
      '',
      '',
      [],
      [],
      ContentType.PRIORITIZATION,
      null,
      100
    );
    this.fillCorrectAnswers();
  }

  initContentForEditing() {
    this.displayAnswers = this.initContentChoiceEditBase();
    this.checkIfAnswersExist();
  }

  answerInputCheck(answer): boolean {
    if (answer !== '') {
      if (!this.answerExists(answer)) {
        return true;
      } else {
        this.showWarning('content.same-answer');
      }
    } else {
      this.showWarning('content.no-empty2');
    }
  }

  checkIfAnswersExist() {
    this.contentService
      .getAnswer(this.content.roomId, this.content.id)
      .subscribe((answer) => {
        this.noAnswersYet = !!(
          answer.roundStatistics[0] as PrioritizationRoundStatistics
        ).assignedPoints;
        this.isLoading = false;
      });
  }

  addAnswer(answer: string) {
    if (this.answerInputCheck(answer)) {
      if (this.displayAnswers.length < 8) {
        this.displayAnswers.push(
          new DisplayAnswer(new AnswerOption(answer), true)
        );
        this.resetAnswerInputEvent.emit(true);
      } else {
        const msg = this.translationService.instant('content.max-answers');
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      }
    }
  }

  deleteAnswer(index: number) {
    this.displayAnswers.splice(index, 1);
    this.afterAnswerDeletion();
  }

  showWarning(translationKey: string) {
    const msg = this.translationService.instant(translationKey);
    this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
  }

  goInEditMode(index: number): void {
    this.isAnswerEdit = index;
  }

  leaveEditMode(): void {
    this.isAnswerEdit = -1;
  }

  createContent(): boolean {
    if (!this.saveAnswerLabels(true)) {
      return;
    }
    if (this.displayAnswers.length >= 2) {
      return true;
    } else {
      const msg = this.translationService.instant('content.need-answers');
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
    }
  }

  resetAnswers() {
    this.displayAnswers = [];
  }
}
