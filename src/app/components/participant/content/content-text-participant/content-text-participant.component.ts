import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContentText } from '../../../../models/content-text';
import { ContentAnswerService } from '../../../../services/http/content-answer.service';
import { TextAnswer } from '../../../../models/text-answer';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../services/util/language.service';
import { ContentType } from '../../../../models/content-type.enum';
import { EventService } from '../../../../services/util/event.service';
import { AuthenticationService } from '../../../../services/http/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalStorageService } from '../../../../services/util/global-storage.service';
import { ContentParticipantComponent } from '../content-participant.component';

@Component({
  selector: 'app-content-text-participant',
  templateUrl: './content-text-participant.component.html',
  styleUrls: ['./content-text-participant.component.scss']
})
export class ContentTextParticipantComponent extends ContentParticipantComponent implements OnInit {

  @Input() content: ContentText;
  @Output() message = new EventEmitter<boolean>();

  givenAnswer: TextAnswer;

  textAnswer = '';
  sentMessage: string;

  constructor(
    protected authenticationService: AuthenticationService,
    protected answerService: ContentAnswerService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected langService: LanguageService,
    protected eventService: EventService,
    protected route: ActivatedRoute,
    protected globalStorageService: GlobalStorageService,
    protected router: Router
  ) {
    super(authenticationService, notificationService, translateService, langService, route, globalStorageService, router);
  }

  initAnswer(userId: string) {
    this.answerService.getTextAnswerByContentIdUserIdCurrentRound(this.content.roomId, this.content.id, userId).subscribe(answer => {
      if (answer) {
        this.givenAnswer = answer;
        this.alreadySent = true;
      }
      this.sendStatusToParent();
      if (this.givenAnswer && this.givenAnswer.body) {
        this.getAnsweredMessage();
      } else {
        this.getAbstainedMessage();
      }
      this.isLoading = false;
    });
  }

  sendStatusToParent() {
    this.message.emit(this.alreadySent);
  }

  getAnsweredMessage() {
    this.translateService.get('answer.has-answered').subscribe(msg => {
      this.sentMessage = msg;
    });
  }

  getAbstainedMessage() {
    this.translateService.get('answer.has-abstained').subscribe(msg => {
      this.sentMessage = msg;
    });
  }

  createAnswer(body?: string) {
    this.givenAnswer = new TextAnswer();
    if (body) {
      this.givenAnswer.body = body;
    }
  }

  submitAnswer() {
    if (this.textAnswer.trim().valueOf() === '') {
      this.translateService.get('answer.please-answer').subscribe(message => {
        this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.WARNING);
      });
      this.textAnswer = '';
      return;
    }
    this.answerService.addAnswerText(this.content.roomId, {
      id: null,
      revision: null,
      contentId: this.content.id,
      round: this.content.state.round,
      subject: this.content.subject,
      body: this.textAnswer,
      read: 'false',
      creationTimestamp: null,
      format: ContentType.TEXT
    } as TextAnswer).subscribe(() => {
      this.createAnswer(this.textAnswer);
      this.getAnsweredMessage();
      this.translateService.get('answer.sent').subscribe(msg => {
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
      });
      this.alreadySent = true;
      this.sendStatusToParent();
    });
  }

  abstain($event) {
    $event.preventDefault();
    this.answerService.addAnswerText(this.content.roomId, {
      id: null,
      revision: null,
      contentId: this.content.id,
      round: this.content.state.round,
      body: null,
      creationTimestamp: null,
      format: ContentType.TEXT
    } as TextAnswer).subscribe();
    this.createAnswer();
    this.getAbstainedMessage();
    this.alreadySent = true;
    this.sendStatusToParent();
  }
}
