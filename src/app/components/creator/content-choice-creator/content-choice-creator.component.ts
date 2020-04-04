import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AnswerOption } from '../../../models/answer-option';
import { ContentChoice } from '../../../models/content-choice';
import { ContentService } from '../../../services/http/content.service';
import { NotificationService } from '../../../services/util/notification.service';
import { ContentType } from '../../../models/content-type.enum';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from '../../../services/util/event.service';
import { RoomService } from '../../../services/http/room.service';
import { ContentCreatePageComponent } from '../content-create-page/content-create-page.component';
import { YesNoDialogComponent } from '../../shared/_dialogs/yes-no-dialog/yes-no-dialog.component';
import { MatDialog } from '@angular/material/dialog';

export class DisplayAnswer {
  answerOption: AnswerOption;
  correct: boolean;

  constructor(answerOption: AnswerOption, correct: boolean) {
    this.answerOption = answerOption;
    this.correct = correct;
  }
}

@Component({
  selector: 'app-content-choice-creator',
  templateUrl: './content-choice-creator.component.html',
  styleUrls: ['./content-choice-creator.component.scss']
})
export class ContentChoiceCreatorComponent implements OnInit {
  @Input() contentSub;
  @Input() contentBod;
  @Input() contentCol;
  @Output() resetP = new EventEmitter<boolean>();

  singleChoice = true;
  content: ContentChoice = new ContentChoice(
    '0',
    '1',
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

  displayedColumns = ['label', 'actions'];

  displayAnswers: DisplayAnswer[] = [];
  lastDeletedDisplayAnswer: DisplayAnswer;

  newAnswerOptionChecked = false;
  newAnswerOptionLabel = '';
  updatedAnswer: string;
  isAnswerEdit = -1;

  roomId: string;

  constructor(private contentService: ContentService,
              private notificationService: NotificationService,
              public dialog: MatDialog,
              private translationService: TranslateService,
              public eventService: EventService,
              private roomService: RoomService) {
  }

  ngOnInit() {
    this.roomId = localStorage.getItem(`roomId`);
    this.fillCorrectAnswers();
  }

  fillCorrectAnswers() {
    this.displayAnswers = [];
    for (let i = 0; i < this.content.options.length; i++) {
      this.displayAnswers.push(new DisplayAnswer(this.content.options[i], this.content.correctOptionIndexes.includes(i)));
    }
  }

  findAnswerIndexByLabel(label: string): number {
    let index = -1;
    for (let i = 0; i < this.content.options.length; i++) {
      if (this.content.options[i].label.valueOf() === label.valueOf()) {
        index = i;
        break;
      }
    }
    return index;
  }

  addAnswer($event) {
    $event.preventDefault();
    if (this.newAnswerOptionLabel === '') {
      this.translationService.get('content.no-empty2').subscribe(message => {
        this.notificationService.show(message);
      });
      this.newAnswerOptionChecked = false;
      this.newAnswerOptionLabel = '';
      return;
    }
    if (this.singleChoice && this.content.correctOptionIndexes.length > 0 && this.newAnswerOptionChecked) {
      this.translationService.get('content.only-one').subscribe(message => {
        this.notificationService.show(message);
      });
      this.newAnswerOptionChecked = false;
      this.newAnswerOptionLabel = '';
      return;
    }
    if (this.checkIfAnswerExists(this.newAnswerOptionLabel.valueOf())) {
      return;
    }
    if (this.content.options.length < 8) {
      const points = (this.newAnswerOptionChecked) ? 10 : -10;
      this.content.options.push(new AnswerOption(this.newAnswerOptionLabel, points));
      this.newAnswerOptionChecked = false;
      this.newAnswerOptionLabel = '';
      this.fillCorrectAnswers();
      document.getElementById('answer-input').focus();
    } else {
      this.translationService.get('content.max-answers').subscribe(msg => {
        this.notificationService.show(msg);
      });
    }
  }

  checkIfAnswerExists(label: string): boolean {
    for (let i = 0; i < this.content.options.length; i++) {
      if (this.content.options[i].label === label) {
        this.translationService.get('content.same-answer').subscribe(message => {
          this.notificationService.show(message);
        });
        return true;
      }
    }
  }

  updateAnswer(index: number, answer: DisplayAnswer) {
    answer.answerOption.label = this.updatedAnswer;
    this.saveChanges(index, answer, answer.correct);
    this.leaveEditMode();
  }

  goInEditMode(index: number, answer: DisplayAnswer): void {
    this.updatedAnswer = answer.answerOption.label;
    this.isAnswerEdit = index;
    document.getElementsByName('answerEdit').item(index).focus();
  }

  leaveEditMode(): void {
    this.isAnswerEdit = -1;
  }

  saveChanges(index: number, answer: DisplayAnswer, matDialogOutput: boolean) {
    if (this.singleChoice) {
      for (const option of this.content.options) {
        option.points = -10;
      }
    }
    this.content.options[index].label = answer.answerOption.label;
    this.content.options[index].points = (answer.correct) ? 10 : -10;
    const indexInCorrectOptionIndexes = this.content.correctOptionIndexes.indexOf(index);
    if (indexInCorrectOptionIndexes === -1 && answer.correct) {
      if (this.singleChoice) {
        this.content.correctOptionIndexes = [index];
        this.fillCorrectAnswers();
        return;
      }
      this.content.correctOptionIndexes.push(index);
    }
    if (indexInCorrectOptionIndexes !== -1 && !answer.correct) {
      this.content.correctOptionIndexes.splice(indexInCorrectOptionIndexes, 1);
    }
    this.fillCorrectAnswers();
    if (matDialogOutput) {
      this.translationService.get('content.changes-made').subscribe(message => {
        this.notificationService.show(message);
      });
    }
  }

  deleteAnswer($event, label: string) {
    $event.preventDefault();
    const index = this.findAnswerIndexByLabel(label);
    this.lastDeletedDisplayAnswer = new DisplayAnswer(this.content.options[index], false);
    this.content.options.splice(index, 1);
    for (let j = 0; j < this.content.correctOptionIndexes.length; j++) {
      if (this.content.correctOptionIndexes[j] === index) {
        this.lastDeletedDisplayAnswer.correct = true;
        this.content.correctOptionIndexes.splice(j, 1);
      }
      if (this.content.correctOptionIndexes[j] > index) {
        this.content.correctOptionIndexes[j] = this.content.correctOptionIndexes[j] - 1;
      }
    }
    this.fillCorrectAnswers();
    this.translationService.get('content.answer-deleted').subscribe(message => {
      this.notificationService.show(message);
    });
  }

  switchValue(label: string) {
    const index = this.findAnswerIndexByLabel(label);
    const answer = new DisplayAnswer(
      new AnswerOption(
        this.displayAnswers[index].answerOption.label,
        this.displayAnswers[index].answerOption.points),
      !this.displayAnswers[index].correct);
    this.saveChanges(index, answer, false);
  }

  openResetDialog($event) {
    const dialogRef = this.dialog.open(YesNoDialogComponent, {
      width: '350px',
      data: {
        section: 'dialog',
        headerLabel: 'sure',
        body: 'really-reset-form',
        confirmLabel: 'reset',
        abortLabel: 'cancel',
        type: 'button-warn'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'reset') {
        this.reset($event);
      }
    });
  }

  reset($event) {
    this.resetP.emit(true);
    $event.preventDefault();
    this.content.subject = '';
    this.content.body = '';
    this.newAnswerOptionLabel = '';
    this.content.options = [];
    this.content.correctOptionIndexes = [];
    this.fillCorrectAnswers();
    this.translationService.get('content.reset-all').subscribe(message => {
      this.notificationService.show(message);
    });
    this.leaveEditMode();
    document.getElementById('subject-input').focus();
  }

  resetAfterSubmit() {
    this.resetP.emit(true);
    this.content.options = [];
    this.content.correctOptionIndexes = [];
    this.fillCorrectAnswers();
    this.translationService.get('content.submitted').subscribe(message => {
      this.notificationService.show(message);
    });
    this.leaveEditMode();
  }

  submitContent() {
    if (this.contentBod === '' || this.contentSub === '') {
      this.translationService.get('content.no-empty').subscribe(message => {
        this.notificationService.show(message);
      });
      return;
    }
    if (this.content.options.length < 2) {
      this.translationService.get('content.need-answers').subscribe(message => {
        this.notificationService.show(message);
      });
      return;
    }
    if (this.singleChoice && this.content.correctOptionIndexes.length !== 1) {
      this.translationService.get('content.select-one').subscribe(message => {
        this.notificationService.show(message);
      });
      return;
    }
    if (!this.singleChoice && this.content.correctOptionIndexes.length < 1) {
      this.translationService.get('content.at-least-one').subscribe(message => {
        this.notificationService.show(message);
      });
      return;
    }
    this.content.multiple = !this.singleChoice;
    this.content.format = ContentType.BINARY;
    this.contentService.addContent(new ContentChoice(
      null,
      null,
      this.roomId,
      this.contentSub,
      this.contentBod,
      [],
      this.content.options,
      this.content.correctOptionIndexes,
      this.content.multiple,
      ContentType.CHOICE,
      null
    )).subscribe(content => {
      if (this.contentCol !== '') {
        this.roomService.addContentToGroup(this.roomId, this.contentCol, content.id).subscribe();
      }
      ContentCreatePageComponent.saveGroupInSessionStorage(this.contentCol);
      this.resetAfterSubmit();
      document.getElementById('subject-input').focus();
    });
  }
}
