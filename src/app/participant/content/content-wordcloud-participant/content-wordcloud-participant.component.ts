import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ContentType } from '@app/core/models/content-type.enum';
import { EventService } from '@app/core/services/util/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { ContentParticipantBaseComponent } from '@app/participant/content/content-participant-base.component';
import { MultipleTextsAnswer } from '@app/core/models/multiple-texts-answer';
import { ContentWordcloud } from '@app/core/models/content-wordcloud';
import { FormService } from '@app/core/services/util/form.service';

@Component({
  selector: 'app-content-wordcloud-participant',
  templateUrl: './content-wordcloud-participant.component.html',
})
export class ContentWordcloudParticipantComponent extends ContentParticipantBaseComponent {
  @Input() content: ContentWordcloud;
  @Input() answer: MultipleTextsAnswer;
  @Output() answerChanged = new EventEmitter<MultipleTextsAnswer>();

  givenAnswer: MultipleTextsAnswer;

  words: string[] = [];

  constructor(
    protected answerService: ContentAnswerService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    public eventService: EventService,
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

  submitAnswer() {
    const words = this.words.filter((w) => w);
    if (words.length === 0) {
      this.translateService.get('answer.please-answer').subscribe((message) => {
        this.notificationService.showAdvanced(
          message,
          AdvancedSnackBarTypes.WARNING
        );
      });
      return;
    }
    this.disableForm();
    const answer = new MultipleTextsAnswer();
    answer.contentId = this.content.id;
    answer.round = this.content.state.round;
    answer.texts = words;
    answer.format = ContentType.WORDCLOUD;
    this.answerService
      .addAnswer(this.content.roomId, answer)
      .subscribe((answer) => {
        this.createAnswer(words);
        this.translateService.get('answer.sent').subscribe((msg) => {
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
    this.words = [];
    const answer = new MultipleTextsAnswer();
    answer.contentId = this.content.id;
    answer.round = this.content.state.round;
    answer.format = ContentType.WORDCLOUD;
    this.answerService
      .addAnswer(this.content.roomId, answer)
      .subscribe((answer) => {
        this.createAnswer();
        this.sendStatusToParent(answer);
      }),
      () => {
        this.enableForm();
      };
  }
}
