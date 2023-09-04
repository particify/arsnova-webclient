import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { TextAnswer } from '@app/core/models/text-answer';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@ngneat/transloco';
import { ContentType } from '@app/core/models/content-type.enum';
import { EventService } from '@app/core/services/util/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { ContentParticipantBaseComponent } from '@app/participant/content/content-participant-base.component';
import { Content } from '@app/core/models/content';
import { FormService } from '@app/core/services/util/form.service';

@Component({
  selector: 'app-content-text-participant',
  templateUrl: './content-text-participant.component.html',
  styleUrls: ['./content-text-participant.component.scss'],
})
export class ContentTextParticipantComponent extends ContentParticipantBaseComponent {
  @Input() content: Content;
  @Input() answer: TextAnswer;
  @Output() answerChanged = new EventEmitter<TextAnswer>();

  givenAnswer: TextAnswer;

  textAnswer = '';

  constructor(
    protected answerService: ContentAnswerService,
    protected notificationService: NotificationService,
    protected translateService: TranslocoService,
    protected eventService: EventService,
    protected route: ActivatedRoute,
    protected globalStorageService: GlobalStorageService,
    protected router: Router,
    protected formService: FormService
  ) {
    super(
      notificationService,
      translateService,
      route,
      globalStorageService,
      router,
      formService
    );
  }

  init() {
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
      this.translateService
        .selectTranslate('participant.answer.please-answer')
        .subscribe((message) => {
          this.notificationService.showAdvanced(
            message,
            AdvancedSnackBarTypes.WARNING
          );
        });
      this.textAnswer = '';
      return;
    }
    this.disableForm();
    const answer = new TextAnswer();
    answer.contentId = this.content.id;
    answer.round = this.content.state.round;
    answer.subject = this.content.subject;
    answer.body = this.textAnswer;
    answer.read = 'false';
    answer.format = ContentType.TEXT;
    this.answerService
      .addAnswerText(this.content.roomId, answer)
      .subscribe((answer) => {
        this.createAnswer(this.textAnswer);
        this.translateService
          .selectTranslate('participant.answer.sent')
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
          });
        this.sendStatusToParent(answer);
      }),
      () => {
        this.enableForm();
      };
  }

  abstain() {
    const answer = new TextAnswer();
    answer.contentId = this.content.id;
    answer.round = this.content.state.round;
    answer.format = ContentType.TEXT;
    this.answerService
      .addAnswerText(this.content.roomId, answer)
      .subscribe((answer) => {
        this.createAnswer();
        this.sendStatusToParent(answer);
      }),
      () => {
        this.enableForm();
      };
  }
}
