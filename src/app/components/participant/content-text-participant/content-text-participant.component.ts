import { Component, Input, OnInit } from '@angular/core';
import { ContentText } from '../../../models/content-text';
import { ContentAnswerService } from '../../../services/http/content-answer.service';
import { AnswerText } from '../../../models/answer-text';
import { NotificationService } from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { ContentType } from '../../../models/content-type.enum';
import { EventService } from '../../../services/util/event.service';
import { AuthenticationService } from '../../../services/http/authentication.service';

@Component({
  selector: 'app-content-text-participant',
  templateUrl: './content-text-participant.component.html',
  styleUrls: ['./content-text-participant.component.scss']
})
export class ContentTextParticipantComponent implements OnInit {
  @Input() content: ContentText;

  givenAnswer: AnswerText;

  textAnswer = '';
  alreadySent = false;
  isLoading = true;

  constructor(
    private authenticationService: AuthenticationService,
    private answerService: ContentAnswerService,
    private notificationService: NotificationService,
    private translateService: TranslateService,
    protected langService: LanguageService,
    public eventService: EventService
  ) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.translateService.use(localStorage.getItem('currentLang'));
    const userId = this.authenticationService.getUser().id;
    this.answerService.getTextAnswerByContentIdUserIdCurrentRound(this.content.id, userId).subscribe(answer => {
      if (answer) {
        this.givenAnswer = answer;
        this.alreadySent = true;
      }
      this.isLoading = false;
    });
  }

  submitAnswer() {
    if (this.textAnswer.trim().valueOf() === '') {
      this.translateService.get('answer.please-answer').subscribe(message => {
        this.notificationService.show(message);
      });
      this.textAnswer = '';
      return;
    }
    this.translateService.get('answer.sent').subscribe(message => {
      this.notificationService.show(message);
    });
    this.answerService.addAnswerText({
      id: null,
      revision: null,
      contentId: this.content.id,
      round: this.content.round,
      subject: this.content.subject,
      body: this.textAnswer,
      read: 'false',
      creationTimestamp: null,
      format: ContentType.TEXT
    } as AnswerText).subscribe();
    this.givenAnswer = new AnswerText();
    this.givenAnswer.body = this.textAnswer;
    this.alreadySent = true;
  }

  abstain($event) {
    $event.preventDefault();
    this.translateService.get('answer.abstention-sent').subscribe(message => {
      this.notificationService.show(message);
    });
  }
}
