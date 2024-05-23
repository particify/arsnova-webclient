import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { TextAnswer } from '@app/core/models/text-answer';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@ngneat/transloco';
import { EventService } from '@app/core/services/util/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { ContentParticipantBaseComponent } from '@app/participant/content/content-participant-base.component';
import { Content } from '@app/core/models/content';
import { FormService } from '@app/core/services/util/form.service';
import { take } from 'rxjs';
import { ContentTextAnswerComponent } from '@app/standalone/content-answers/content-text-answer/content-text-answer.component';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { FlexModule } from '@angular/flex-layout';

@Component({
  selector: 'app-content-text-participant',
  templateUrl: './content-text-participant.component.html',
  styleUrls: ['./content-text-participant.component.scss'],
  standalone: true,
  imports: [FlexModule, NgIf, FormsModule, ContentTextAnswerComponent],
})
export class ContentTextParticipantComponent extends ContentParticipantBaseComponent {
  @Input({ required: true }) content!: Content;
  @Input({ required: true }) answer!: TextAnswer;
  @Output() answerChanged = new EventEmitter<TextAnswer>();

  givenAnswer?: TextAnswer;

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

  submitAnswer() {
    if (this.textAnswer.trim().valueOf() === '') {
      this.translateService
        .selectTranslate('participant.answer.please-answer')
        .pipe(take(1))
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
    const answer = new TextAnswer(
      this.content.id,
      this.content.state.round,
      this.textAnswer
    );
    this.answerService
      .addAnswerText(this.content.roomId, answer)
      .subscribe((answer) => {
        this.givenAnswer = answer;
        this.translateService
          .selectTranslate('participant.answer.sent')
          .pipe(take(1))
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
    const answer = new TextAnswer(this.content.id, this.content.state.round);
    this.answerService
      .addAnswerText(this.content.roomId, answer)
      .subscribe((answer) => {
        this.givenAnswer = answer;
        this.sendStatusToParent(answer);
      }),
      () => {
        this.enableForm();
      };
  }
}
