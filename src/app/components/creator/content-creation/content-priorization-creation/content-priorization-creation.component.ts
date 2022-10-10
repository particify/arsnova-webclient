import { Component, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContentType } from '@arsnova/app/models/content-type.enum';
import { ContentGroupService } from '@arsnova/app/services/http/content-group.service';
import { ContentService } from '@arsnova/app/services/http/content.service';
import { AnnounceService } from '@arsnova/app/services/util/announce.service';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { AnswerOption } from '@arsnova/app/models/answer-option';
import { AdvancedSnackBarTypes } from '@arsnova/app/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ContentCreationComponent, DisplayAnswer } from '../content-creation/content-creation.component';
import { ContentPriorization } from '@arsnova/app/models/content-priorization';
import { PriorizationRoundStatistics } from '@arsnova/app/models/round-statistics';

@Component({
  selector: 'app-content-priorization-creation',
  templateUrl: './content-priorization-creation.component.html',
  styleUrls: ['./content-priorization-creation.component.scss']
})
export class ContentPriorizationCreationComponent extends ContentCreationComponent implements OnInit {

  isAnswerEdit = -1;
  resetAnswerInputEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    protected contentService: ContentService,
    protected notificationService: NotificationService,
    protected translationService: TranslateService,
    protected route: ActivatedRoute,
    protected contentGroupService: ContentGroupService,
    protected announceService: AnnounceService
  ) {
    super(contentService, notificationService, translationService, route, contentGroupService, announceService);
  }

  initContentCreation() {
    this.content = new ContentPriorization(
      null,
      null,
      '',
      '',
      '',
      [],
      [],
      ContentType.PRIORIZATION,
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
    this.contentService.getAnswer(this.content.roomId, this.content.id).subscribe(answer => {
      this.noAnswersYet = !!(answer.roundStatistics[0] as PriorizationRoundStatistics).assignedPoints;
      this.isLoading = false;
    });
  }

  addAnswer(answer: string) {
    if (this.answerInputCheck(answer)) {
      if (this.displayAnswers.length < 8) {
        this.displayAnswers.push(new DisplayAnswer(new AnswerOption(answer), true));
        this.resetAnswerInputEvent.emit(true);
      } else {
        const msg = this.translationService.instant('content.max-answers');
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
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
