import { Component, Input, inject } from '@angular/core';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { TextAnswer } from '@app/core/models/text-answer';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { provideTranslocoScope, TranslocoService } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { ContentParticipantBaseComponent } from '@app/participant/content/content-participant-base.component';
import { Content } from '@app/core/models/content';
import { FormService } from '@app/core/services/util/form.service';
import { take } from 'rxjs';
import { ContentTextAnswerComponent } from '@app/standalone/content-answers/content-text-answer/content-text-answer.component';
import { FormsModule } from '@angular/forms';

import { FlexModule } from '@angular/flex-layout';
import { AnswerResultType } from '@app/core/models/answer-result';

@Component({
  selector: 'app-content-text-participant',
  templateUrl: './content-text-participant.component.html',
  styleUrls: ['./content-text-participant.component.scss'],
  imports: [FlexModule, FormsModule, ContentTextAnswerComponent],
  providers: [provideTranslocoScope('participant')],
})
export class ContentTextParticipantComponent extends ContentParticipantBaseComponent {
  protected answerService = inject(ContentAnswerService);
  protected notificationService: NotificationService;
  protected translateService: TranslocoService;
  protected globalStorageService: GlobalStorageService;
  protected router: Router;
  protected formService: FormService;

  @Input({ required: true }) content!: Content;
  @Input() answer?: TextAnswer;

  textAnswer = '';

  constructor() {
    const notificationService = inject(NotificationService);
    const translateService = inject(TranslocoService);
    const globalStorageService = inject(GlobalStorageService);
    const router = inject(Router);
    const formService = inject(FormService);

    super(
      notificationService,
      translateService,
      globalStorageService,
      router,
      formService
    );

    this.notificationService = notificationService;
    this.translateService = translateService;
    this.globalStorageService = globalStorageService;
    this.router = router;
    this.formService = formService;
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
    this.answerService.addAnswerText(this.content.roomId, answer).subscribe(
      (answer) => {
        this.answer = answer;
        this.translateService
          .selectTranslate('participant.answer.sent')
          .pipe(take(1))
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
          });
        this.sendStatusToParent(AnswerResultType.NEUTRAL);
      },
      () => {
        this.enableForm();
      }
    );
  }

  abstain() {
    const answer = new TextAnswer(this.content.id, this.content.state.round);
    this.answerService.addAnswerText(this.content.roomId, answer).subscribe(
      (answer) => {
        this.answer = answer;
        this.sendStatusToParent(AnswerResultType.ABSTAINED);
      },
      () => {
        this.enableForm();
      }
    );
  }
}
