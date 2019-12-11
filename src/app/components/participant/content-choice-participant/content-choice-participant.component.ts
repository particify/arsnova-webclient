import { Component, Input, OnInit } from '@angular/core';
import { ContentChoice } from '../../../models/content-choice';
import { AnswerOption } from '../../../models/answer-option';
import { ContentAnswerService } from '../../../services/http/content-answer.service';
import { NotificationService } from '../../../services/util/notification.service';
import { AnswerChoice } from '../../../models/answer-choice';
import { ContentType } from '../../../models/content-type.enum';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { AuthenticationService } from '../../../services/http/authentication.service';

class CheckedAnswer {
  answerOption: AnswerOption;
  checked: boolean;

  constructor(answerOption: AnswerOption, checked: boolean) {
    this.answerOption = answerOption;
    this.checked = checked;
  }
}

@Component({
  selector: 'app-content-choice-participant',
  templateUrl: './content-choice-participant.component.html',
  styleUrls: ['./content-choice-participant.component.scss']
})
export class ContentChoiceParticipantComponent implements OnInit {

  @Input() content: ContentChoice;

  ContentType: typeof ContentType = ContentType;
  selectedSingleAnswer: string;
  checkedAnswers: CheckedAnswer[] = [];
  alreadySent = false;
  correctOptionIndexes: number[] = [];
  isCorrect = false;
  isLoading = true;

  constructor(
    private authenticationService: AuthenticationService,
    private answerService: ContentAnswerService,
    private notificationService: NotificationService,
    private translateService: TranslateService,
    protected langService: LanguageService
  ) {
  langService.langEmitter.subscribe(lang => translateService.use(lang));
}

  ngOnInit() {
    this.initAnswers();
    const userId = this.authenticationService.getUser().id;
    this.getCorrectAnswer();
    this.answerService.getChoiceAnswerByContentIdUserIdCurrentRound(this.content.id, userId).subscribe(answer => {
      if (answer) {
        if (answer.selectedChoiceIndexes && answer.selectedChoiceIndexes.length > 0) {
          for (const i of answer.selectedChoiceIndexes) {
            this.checkedAnswers[i].checked = true;
          }
        }
        this.checkAnswer(answer.selectedChoiceIndexes);
        this.alreadySent = true;
      }
      this.isLoading = false;
    });
    this.translateService.use(localStorage.getItem('currentLang'));
  }

  initAnswers(): void {
    for (const answerOption of this.content.options) {
      this.checkedAnswers.push(new CheckedAnswer(answerOption, false));
    }
  }

  getCorrectAnswer() {
    if (!(this.content.format === ContentType.SCALE)) {
      for (const i in this.content.options) {
        if (this.content.options[i].points > 0) {
          this.correctOptionIndexes.push(Number(i));
        }
      }
    }
  }

  checkAnswer(selectedAnswers: number[]) {
    if (!(this.content.format === ContentType.SCALE)) {
      if (this.correctOptionIndexes.length === selectedAnswers.length &&
        this.correctOptionIndexes.every((value, index) => value === selectedAnswers[index])) {
        this.isCorrect = true;
      }
    }
  }

  submitAnswer(): void {
    const selectedAnswers: number[] = [];
    if (this.content.multiple) {
      for (let i = 0; i < this.checkedAnswers.length; i++) {
        if (this.checkedAnswers[i].checked) {
          selectedAnswers.push(i);
        }
      }
    } else {
      for (let i = 0; i < this.checkedAnswers.length; i++) {
        if (this.checkedAnswers[i].answerOption.label === this.selectedSingleAnswer) {
          selectedAnswers.push(i);
          break;
        }
      }
    }
    if (selectedAnswers.length === 0) {
      if (this.content.multiple) {
        this.translateService.get('answer.at-least-one').subscribe(message => {
          this.notificationService.show(message);
        });
      } else {
        this.translateService.get('answer.please-one').subscribe(message => {
          this.notificationService.show(message);
        });
      }
      return;
    }
    this.translateService.get('answer.sent').subscribe(message => {
      this.notificationService.show(message);
    });
    this.answerService.addAnswerChoice({
      id: null,
      revision: null,
      contentId: this.content.id,
      round: 1,
      selectedChoiceIndexes: selectedAnswers,
      creationTimestamp: null,
      format: ContentType.CHOICE
    } as AnswerChoice).subscribe(() => {
      this.checkAnswer(selectedAnswers);
      this.alreadySent = true;
    });
  }

  abstain($event) {
    $event.preventDefault();
    this.translateService.get('answer.abstention-sent').subscribe(message => {
      this.notificationService.show(message);
    });
    this.answerService.addAnswerChoice({
      id: null,
      revision: null,
      contentId: this.content.id,
      round: 1,
      selectedChoiceIndexes: [],
      creationTimestamp: null,
      format: ContentType.CHOICE
    } as AnswerChoice).subscribe();
    this.alreadySent = true;
  }
}
