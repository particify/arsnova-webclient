import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ChoiceAnswer } from '../../../../models/choice-answer';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { ContentAnswerService } from '../../../../services/http/content-answer.service';
import { ContentType } from '../../../../models/content-type.enum';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../../../../services/http/authentication.service';
import { AnswerOption } from '../../../../models/answer-option';
import { ContentChoice } from '@arsnova/app/models/content-choice';
import { ContentParticipantBaseComponent } from '../content-participant-base.component';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';


@Component({
  selector: 'app-content-sort-participant',
  templateUrl: './content-sort-participant.component.html',
  styleUrls: ['./content-sort-participant.component.scss']
})
export class ContentSortParticipantComponent extends ContentParticipantBaseComponent implements OnInit {

  @Input() content: ContentChoice;
  @Input() answer: ChoiceAnswer;
  @Input() alreadySent: boolean;
  @Input() sendEvent: EventEmitter<string>;
  @Output() message = new EventEmitter<ChoiceAnswer>();

  isLoading = true;
  hasAbstained = false;
  answerOptions: AnswerOption[] = [];

  constructor(protected answerService: ContentAnswerService,
              protected notificationService: NotificationService,
              protected translateService: TranslateService,
              protected authenticationService: AuthenticationService,
              protected langService: LanguageService,
              protected route: ActivatedRoute,
              protected globalStorageService: GlobalStorageService,
              protected router: Router
  ) {
    super(authenticationService, notificationService, translateService, langService, route, globalStorageService, router);
  }

  initAnswer(userId: string) {
      if (this.answer) {
        this.setSortOfAnswer(this.answer.selectedChoiceIndexes);
        this.alreadySent = true;
      } else {
        this.answerOptions = this.shuffleAnswerOptions(JSON.parse(JSON.stringify(this.content.options)));
      }
      this.isLoading = false;
  }

  shuffleAnswerOptions(answers: AnswerOption[]): AnswerOption[] {
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i);
      const temp = answers[i];
      answers[i] = answers[j];
      answers[j] = temp;
    }
    return answers;
  }

  setSortOfAnswer(sorting: number[]) {
    for (let i = 0; i < sorting.length; i++) {
      this.answerOptions[i] = this.content.options[sorting[i]];
    }
  }

  setSorting(): number[] {
    const selectedSorting: number[] = [];
    for (const [index, answer] of this.answerOptions.entries()) {
      selectedSorting[index] = this.content.options.map(a => a.label).indexOf(answer.label);
    }
    return selectedSorting;
  }

  submitAnswer() {
    this.answerService.addAnswerChoice(this.content.roomId, {
      id: null,
      revision: null,
      contentId: this.content.id,
      round: this.content.state.round,
      selectedChoiceIndexes: this.setSorting(),
      creationTimestamp: null,
      format: ContentType.SORT
    } as ChoiceAnswer).subscribe(answer  => {
      /*      if (this.isChoice) {
              this.checkAnswer(selectedAnswers);
            }*/
      this.translateService.get('answer.sent').subscribe(msg => {
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
      });
      this.sendStatusToParent(answer);
    });
  }

  abstain() {
    this.answerService.addAnswerChoice(this.content.roomId, {
      id: null,
      revision: null,
      contentId: this.content.id,
      round: this.content.state.round,
      selectedChoiceIndexes: [],
      creationTimestamp: null,
      format: ContentType.CHOICE
    } as ChoiceAnswer).subscribe(answer => {
      this.hasAbstained = true;
      this.sendStatusToParent(answer);
    });
  }

}
