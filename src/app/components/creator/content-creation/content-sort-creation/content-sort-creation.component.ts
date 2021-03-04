import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ContentService } from '../../../../services/http/content.service';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { RoomService } from '../../../../services/http/room.service';
import { GlobalStorageService } from '../../../../services/util/global-storage.service';
import { ContentType } from '../../../../models/content-type.enum';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { ContentChoice } from '../../../../models/content-choice';
import { AnswerOption } from '../../../../models/answer-option';
import {
  ContentCreationComponent,
  DisplayAnswer
} from '../content-creation/content-creation.component';
import { AnnounceService } from '../../../../services/util/announce.service';

@Component({
  selector: 'app-content-sort-creation',
  templateUrl: './content-sort-creation.component.html',
  styleUrls: ['./content-sort-creation.component.scss']
})
export class ContentSortCreationComponent extends ContentCreationComponent implements OnInit {

  isAnswerEdit = -1;
  updatedAnswer: string;
  newAnswer: string;

  constructor(
    protected contentService: ContentService,
    protected notificationService: NotificationService,
    protected translationService: TranslateService,
    protected roomService: RoomService,
    protected globalStorageService: GlobalStorageService,
    protected contentGroupService: ContentGroupService,
    private announceService: AnnounceService
  ) {
    super(contentService, notificationService, translationService, roomService, globalStorageService, contentGroupService);
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
    const options = this.initContentChoiceEditBase();
    for (let i = 0; i < options.length; i++) {
      const correct = options[i].points > 0;
      this.displayAnswers.push(new DisplayAnswer(new AnswerOption(options[i].label, options[i].points), correct));
      if (correct) {
        (this.content as ContentChoice).correctOptionIndexes.push(i);
      }
    }
    this.isLoading = false;
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
        this.displayAnswers.push(new DisplayAnswer(new AnswerOption(this.newAnswer, 0), true));
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
      this.displayAnswers.map(o => o.answerOption.points =  10);
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
