import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContentAnswerService } from '../../../../services/http/content-answer.service';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../services/util/language.service';
import { ContentType } from '../../../../models/content-type.enum';
import { EventService } from '../../../../services/util/event.service';
import { AuthenticationService } from '../../../../services/http/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalStorageService } from '../../../../services/util/global-storage.service';
import { ContentParticipantBaseComponent } from '../content-participant-base.component';
import { MultipleTextsAnswer } from '../../../../models/multiple-texts-answer';
import { ContentWordcloud } from '../../../../models/content-wordcloud';

@Component({
  selector: 'app-content-wordcloud-participant',
  templateUrl: './content-wordcloud-participant.component.html',
  styleUrls: ['./content-wordcloud-participant.component.scss']
})
export class ContentWordcloudComponent extends ContentParticipantBaseComponent {

  @Input() content: ContentWordcloud;
  @Input() answer: MultipleTextsAnswer;
  @Input() alreadySent: boolean;
  @Input() sendEvent: EventEmitter<string>;
  @Output() answerChanged = new EventEmitter<MultipleTextsAnswer>();

  readonly maxLength = 25;

  givenAnswer: MultipleTextsAnswer;

  words: string[] = [];
  currentInputIndex: number;

  constructor(
    protected authenticationService: AuthenticationService,
    protected answerService: ContentAnswerService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected langService: LanguageService,
    public eventService: EventService,
    protected route: ActivatedRoute,
    protected globalStorageService: GlobalStorageService,
    protected router: Router
  ) {
    super(authenticationService, notificationService, translateService, langService, route, globalStorageService, router);
  }

  init() {
    if (this.answer) {
      this.givenAnswer = this.answer;
      this.words = this.answer.texts;
    } else {
      this.words = new Array<string>(this.content.maxAnswers).fill('');
    }
    this.isLoading = false;
  }

  createAnswer(texts?: string[]) {
    this.givenAnswer = new MultipleTextsAnswer();
    if (texts) {
      this.givenAnswer.texts = texts;
    }
  }

  trackByIndex(index: number) {
    return index;
  }

  submitAnswer() {
    const words = this.words.filter(w => w);
    if (words.length === 0) {
      this.translateService.get('answer.please-answer').subscribe(message => {
        this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.WARNING);
      });
      return;
    }
    this.answerService.addAnswer(this.content.roomId, {
      id: null,
      revision: null,
      contentId: this.content.id,
      round: this.content.state.round,
      texts: words,
      creationTimestamp: null,
      format: ContentType.WORDCLOUD
    }).subscribe(answer => {
      this.createAnswer(words);
      this.translateService.get('answer.sent').subscribe(msg => {
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
      });
      this.sendStatusToParent(answer);
    });
  }

  abstain() {
    this.words = [];
    this.answerService.addAnswer(this.content.roomId, {
      id: null,
      revision: null,
      contentId: this.content.id,
      round: this.content.state.round,
      texts: [],
      creationTimestamp: null,
      format: ContentType.WORDCLOUD
    }).subscribe(answer => {
      this.createAnswer();
      this.sendStatusToParent(answer);
    });
  }
}
