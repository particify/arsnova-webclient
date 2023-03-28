import { Component, EventEmitter, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ContentService } from '@core/services/http/content.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@core/services/util/notification.service';
import { ActivatedRoute } from '@angular/router';
import { ContentType } from '@core/models/content-type.enum';
import { ContentGroupService } from '@core/services/http/content-group.service';
import { ContentChoice } from '@core/models/content-choice';
import { AnswerOption } from '@core/models/answer-option';
import {
  ContentCreationComponent,
  DisplayAnswer,
} from '@creator/content-creation/content-creation/content-creation.component';
import { AnnounceService } from '@core/services/util/announce.service';

@Component({
  selector: 'app-content-sort-creation',
  templateUrl: './content-sort-creation.component.html',
  styleUrls: ['./content-sort-creation.component.scss'],
})
export class ContentSortCreationComponent
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
    protected announceService: AnnounceService
  ) {
    super(
      contentService,
      notificationService,
      translationService,
      route,
      contentGroupService,
      announceService
    );
  }

  initContentCreation() {
    this.content = new ContentChoice(
      null,
      null,
      '',
      '',
      '',
      [],
      [],
      [],
      true,
      ContentType.SORT,
      null
    );
    this.fillCorrectAnswers();
  }

  initContentForEditing() {
    this.displayAnswers = this.initContentChoiceEditBase();
    this.updateDragDropList();
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

  addAnswer(answer: string) {
    if (this.answerInputCheck(answer)) {
      if (this.displayAnswers.length < 8) {
        this.displayAnswers.push(
          new DisplayAnswer(new AnswerOption(answer), true)
        );
        this.updateDragDropList();
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
    this.updateDragDropList();
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
      (this.content as ContentChoice).correctOptionIndexes = Object.keys(
        this.displayAnswers.map((a) => a.answerOption)
      ).map((index) => parseInt(index, 10));
      return true;
    } else {
      const msg = this.translationService.instant('content.need-answers');
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
    }
  }

  updateDragDropList() {
    this.dragDroplist = this.displayAnswers;
  }
}
