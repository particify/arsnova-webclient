import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ContentService } from '../../../../services/http/content.service';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { RoomService } from '../../../../services/http/room.service';
import { ContentType } from '../../../../models/content-type.enum';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { ContentChoice } from '../../../../models/content-choice';
import { AnswerOption } from '../../../../models/answer-option';
import {
  ContentCreationComponent,
  DisplayAnswer
} from '../content-creation/content-creation.component';
import { AnnounceService } from '../../../../services/util/announce.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-content-sort-creation',
  templateUrl: './content-sort-creation.component.html',
  styleUrls: ['./content-sort-creation.component.scss']
})
export class ContentSortCreationComponent extends ContentCreationComponent implements OnInit {

  isAnswerEdit = -1;
  updatedAnswer: string;
  newAnswer: string;
  noAnswersYet = false;

  constructor(
    protected contentService: ContentService,
    protected notificationService: NotificationService,
    protected translationService: TranslateService,
    protected roomService: RoomService,
    protected contentGroupService: ContentGroupService,
    protected route: ActivatedRoute,
    private announceService: AnnounceService
  ) {
    super(contentService, notificationService, translationService, roomService, contentGroupService, route);
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
    this.contentService.getAnswer(this.content.roomId, this.content.id).subscribe(answer => {
      const answerCount = answer.roundStatistics[0].independentCounts.reduce(function(a, b) {
        return a + b;
      });
      this.noAnswersYet = answerCount === 0;
      this.isLoading = false;
    });
  }

  drop(event: CdkDragDrop<String[]>) {
    moveItemInArray(this.displayAnswers, event.previousIndex, event.currentIndex);
  }

  answerInputCheck(isUpdate?: boolean): boolean {
    const answer = isUpdate ? this.updatedAnswer : this.newAnswer;
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

  addAnswer() {
    if (this.answerInputCheck()) {
      if (this.displayAnswers.length < 8) {
        this.displayAnswers.push(new DisplayAnswer(new AnswerOption(this.newAnswer), true));
        this.newAnswer = '';
      } else {
        const msg = this.translationService.instant('content.max-answers');
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      }
    }
  }

  answerExists(answer: string): boolean {
    return this.displayAnswers.map(o => o.answerOption.label).indexOf(answer) >= 0;
  }

  deleteAnswer(index: number) {
    this.displayAnswers.splice(index, 1);
  }

  updateAnswer(index: number) {
    if (this.answerInputCheck(true)) {
      this.displayAnswers[index].answerOption.label = this.updatedAnswer;
      this.leaveEditMode();
      this.announceService.announce('content.a11y-updated');
    }
  }

  showWarning(translationKey: string) {
    const msg = this.translationService.instant(translationKey);
    this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
  }

  goInEditMode(index: number, answer: string): void {
    this.updatedAnswer = answer;
    this.isAnswerEdit = index;
    document.getElementsByName('answerEdit').item(index).focus();
  }

  leaveEditMode(aborted?: boolean): void {
    this.isAnswerEdit = -1;
    if (aborted) {
      this.announceService.announce('content.a11y-aborted');
    }
  }

  createContent(): boolean {
    if (this.displayAnswers.length >= 2) {
      (this.content as ContentChoice).options = this.displayAnswers.map(o => o.answerOption);
      (this.content as ContentChoice).correctOptionIndexes = Object.keys(this.displayAnswers.map(a => a.answerOption))
        .map(index => parseInt(index, 10));
      return true;
    } else {
      const msg = this.translationService.instant('content.min-answers');
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
    }
  }

}
