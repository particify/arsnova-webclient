import { Component, EventEmitter, OnInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { ContentService } from '@app/core/services/http/content.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { ActivatedRoute } from '@angular/router';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentChoice } from '@app/core/models/content-choice';
import { AnswerOption } from '@app/core/models/answer-option';
import {
  ContentCreationComponent,
  DisplayAnswer,
} from '@app/creator/content-creation/content-creation/content-creation.component';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { FormService } from '@app/core/services/util/form.service';
import { ContentType } from '@app/core/models/content-type.enum';

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
    protected translationService: TranslocoService,
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
    this.content = new ContentChoice();
    this.content.format = ContentType.SORT;
    this.fillCorrectAnswers();
  }

  initContentForEditing() {
    this.displayAnswers = this.initContentChoiceEditBase();
    this.updateDragDropList();
    this.checkIfAnswersExist();
  }

  answerInputCheck(answer: string): boolean {
    if (answer !== '') {
      if (!this.answerExists(answer)) {
        return true;
      } else {
        this.showWarning('creator.content.same-answer');
      }
    } else {
      this.showWarning('creator.content.no-empty2');
    }
    return false;
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
        const msg = this.translationService.translate(
          'creator.content.max-answers'
        );
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
    const msg = this.translationService.translate(translationKey);
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
      return false;
    }
    if (this.displayAnswers.length >= 2) {
      (this.content as ContentChoice).correctOptionIndexes = Object.keys(
        this.displayAnswers.map((a) => a.answerOption)
      ).map((index) => parseInt(index, 10));
      return true;
    } else {
      const msg = this.translationService.translate(
        'creator.content.need-answers'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return false;
    }
  }

  updateDragDropList() {
    this.dragDroplist = this.displayAnswers;
  }
}
