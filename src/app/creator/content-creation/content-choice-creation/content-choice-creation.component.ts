import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { AnswerOption } from '@app/core/models/answer-option';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentService } from '@app/core/services/http/content.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { ContentType } from '@app/core/models/content-type.enum';
import { TranslateService } from '@ngx-translate/core';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import {
  ContentCreationComponent,
  DisplayAnswer,
} from '@app/creator/content-creation/content-creation/content-creation.component';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { ActivatedRoute } from '@angular/router';
import { CreateAnswerOptionComponent } from '@app/creator/content-creation/create-answer-option/create-answer-option.component';

@Component({
  selector: 'app-content-choice-creation',
  templateUrl: './content-choice-creation.component.html',
  styleUrls: ['./content-choice-creation.component.scss'],
})
export class ContentChoiceCreationComponent
  extends ContentCreationComponent
  implements OnInit
{
  @ViewChild(CreateAnswerOptionComponent)
  createAnswerOptionComponent: CreateAnswerOptionComponent;

  multipleCorrectAnswers = false;
  noCorrectAnswers = false;
  newAnswerOptionChecked = false;
  resetAnswerInputEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  isAnswerEdit = -1;

  constructor(
    protected contentService: ContentService,
    protected notificationService: NotificationService,
    protected translationService: TranslateService,
    protected contentGroupService: ContentGroupService,
    protected route: ActivatedRoute,
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
      ContentType.CHOICE,
      null
    );
    this.isLoading = false;
  }

  initContentForEditing() {
    this.displayAnswers = this.initContentChoiceEditBase();
    this.multipleCorrectAnswers = (this.content as ContentChoice).multiple;
    this.noCorrectAnswers = !(this.content as ContentChoice)
      .correctOptionIndexes;
    this.checkIfAnswersExist();
  }

  addAnswer(answer: string) {
    if (answer === '') {
      this.translationService.get('content.no-empty2').subscribe((message) => {
        this.notificationService.showAdvanced(
          message,
          AdvancedSnackBarTypes.FAILED
        );
      });
      this.newAnswerOptionChecked = false;
      this.resetAnswerInputEvent.emit(true);
      return;
    }
    if (
      !this.multipleCorrectAnswers &&
      (this.content as ContentChoice).correctOptionIndexes?.length > 0 &&
      this.newAnswerOptionChecked
    ) {
      this.translationService.get('content.only-one').subscribe((message) => {
        this.notificationService.showAdvanced(
          message,
          AdvancedSnackBarTypes.FAILED
        );
      });
      this.newAnswerOptionChecked = false;
      this.resetAnswerInputEvent.emit(true);
      return;
    }
    if (this.answerExists(answer)) {
      return;
    }
    if ((this.content as ContentChoice).options.length < 8) {
      (this.content as ContentChoice).options.push(new AnswerOption(answer));
      this.newAnswerOptionChecked = false;
      this.resetAnswerInputEvent.emit(true);
      this.fillCorrectAnswers();
      document.getElementById('answer-input').focus();
      this.announceService.announce('content.a11y-answer-added');
    } else {
      const msg = this.translationService.instant('content.max-answers');
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.FAILED);
    }
  }

  goInEditMode(index: number): void {
    this.isAnswerEdit = index;
  }

  leaveEditMode(): void {
    this.saveAnswerLabels();
    this.isAnswerEdit = -1;
  }

  deleteAnswer(index: number) {
    (this.content as ContentChoice).options.splice(index, 1);
    for (
      let j = 0;
      j < (this.content as ContentChoice).correctOptionIndexes?.length;
      j++
    ) {
      if ((this.content as ContentChoice).correctOptionIndexes[j] === index) {
        (this.content as ContentChoice).correctOptionIndexes.splice(j, 1);
      }
      if ((this.content as ContentChoice).correctOptionIndexes[j] > index) {
        (this.content as ContentChoice).correctOptionIndexes[j] =
          (this.content as ContentChoice).correctOptionIndexes[j] - 1;
      }
    }
    this.fillCorrectAnswers();
    this.afterAnswerDeletion();
  }

  saveChanges(index: number, answer: DisplayAnswer) {
    (this.content as ContentChoice).options[index].label =
      answer.answerOption.label;
    if (!(this.content as ContentChoice).correctOptionIndexes) {
      (this.content as ContentChoice).correctOptionIndexes = [];
    }
    const indexInCorrectOptionIndexes = (
      this.content as ContentChoice
    ).correctOptionIndexes.indexOf(index);
    if (indexInCorrectOptionIndexes === -1 && answer.correct) {
      if (!this.multipleCorrectAnswers) {
        (this.content as ContentChoice).correctOptionIndexes = [index];
        this.fillCorrectAnswers();
        return;
      }
      (this.content as ContentChoice).correctOptionIndexes.push(index);
    }
    if (indexInCorrectOptionIndexes !== -1 && !answer.correct) {
      (this.content as ContentChoice).correctOptionIndexes.splice(
        indexInCorrectOptionIndexes,
        1
      );
    }
    this.fillCorrectAnswers();
  }

  switchValue(label: string, index: number) {
    const answer = new DisplayAnswer(
      new AnswerOption(this.displayAnswers[index].answerOption.label),
      !this.displayAnswers[index].correct
    );
    this.saveChanges(index, answer);
    const state = answer.correct ? 'correct' : 'wrong';
    this.announceService.announce('content.a11y-answer-marked-' + state);
  }

  removeCorrectAnswers() {
    for (let i = 0; i < this.displayAnswers.length; i++) {
      this.displayAnswers[i].correct = false;
      this.saveChanges(i, this.displayAnswers[i]);
    }
  }

  createContent(): boolean {
    if ((this.content as ContentChoice).options.length < 2) {
      const msg = this.translationService.instant('content.need-answers');
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return;
    }
    if (
      !this.multipleCorrectAnswers &&
      !this.noCorrectAnswers &&
      (this.content as ContentChoice).correctOptionIndexes.length !== 1
    ) {
      const msg = this.translationService.instant('content.select-one');
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return;
    }
    if (
      this.multipleCorrectAnswers &&
      !this.noCorrectAnswers &&
      (this.content as ContentChoice).correctOptionIndexes.length < 1
    ) {
      const msg = this.translationService.instant('content.at-least-one');
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return;
    }
    if (this.createAnswerOptionComponent?.newAnswer.length > 0) {
      const msg = this.translationService.instant('content.unsaved-answer');
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return;
    }
    (this.content as ContentChoice).multiple = this.multipleCorrectAnswers;
    if (!this.saveAnswerLabels(true)) {
      return;
    }
    return true;
  }
}
