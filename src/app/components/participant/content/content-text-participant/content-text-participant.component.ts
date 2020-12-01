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
import { ContentParticipantBaseComponent } from '../content-participant-base.component';

@Component({
  selector: 'app-content-text-participant',
  templateUrl: './content-text-participant.component.html',
  styleUrls: ['./content-text-participant.component.scss']
})
export class ContentTextParticipantComponent extends ContentParticipantBaseComponent implements OnInit {

  @Input() content: ContentText;
  @Input() answer: TextAnswer;
  @Input() alreadySent: boolean;
  @Input() sendEvent: EventEmitter<string>;
  @Output() message = new EventEmitter<TextAnswer>();

  givenAnswer: TextAnswer;

  textAnswer = '';

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
    if (this.answer) {
      this.givenAnswer = this.answer;
    }
    this.isLoading = false;
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
    } as TextAnswer).subscribe(answer => {
      this.createAnswer(this.textAnswer);
      this.translateService.get('answer.sent').subscribe(msg => {
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
      });
      this.sendStatusToParent(answer);
    });
  }

  abstain() {
    this.answerService.addAnswerText(this.content.roomId, {
      id: null,
      revision: null,
      contentId: this.content.id,
      round: this.content.state.round,
      body: null,
      creationTimestamp: null,
      format: ContentType.TEXT
    } as TextAnswer).subscribe(answer => {
      this.createAnswer();
      this.sendStatusToParent(answer);
    });
  }
}
