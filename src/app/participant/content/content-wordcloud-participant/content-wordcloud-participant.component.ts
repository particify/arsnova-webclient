import {
  Component,
  inject,
  ChangeDetectionStrategy,
  input,
  output,
  linkedSignal,
} from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { provideTranslocoScope, TranslocoService } from '@jsverse/transloco';
import { take } from 'rxjs';
import { mutationHelper } from '@gql/helper/mutation-helper';
import { ContentWordcloudAnswerComponent } from '@app/standalone/content-answers/content-wordcloud-answer/content-wordcloud-answer.component';
import {
  Answer,
  AnswerResultState,
  CreateQuestionnaireWordcloudAnswerGql,
  WordcloudAnswerFormatData,
  WordcloudContentFormatData,
} from '@gql/generated/graphql';
import { AnswerForm } from '@app/participant/content/answer-form';

@Component({
  selector: 'app-content-wordcloud-participant',
  templateUrl: './content-wordcloud-participant.component.html',
  imports: [ContentWordcloudAnswerComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [provideTranslocoScope('participant')],
})
export class ContentWordcloudParticipantComponent implements AnswerForm {
  private readonly translateService = inject(TranslocoService);
  private readonly notificationService = inject(NotificationService);
  private readonly createAnswer = inject(CreateQuestionnaireWordcloudAnswerGql);
  private readonly mutations = mutationHelper();

  readonly contentId = input.required<string>();
  readonly roundId = input.required<string>();
  readonly contentFormatData = input.required<WordcloudContentFormatData>();
  readonly answerFormatData = input<WordcloudAnswerFormatData>();
  readonly result = input<AnswerResultState | undefined>(
    AnswerResultState.Unanswered
  );
  readonly correctOptionsPublished = input<boolean>(false);
  readonly answerCreated = output<Answer>();
  readonly words = linkedSignal(
    () =>
      this.answerFormatData()?.words ??
      new Array<string>(this.contentFormatData().maxAnswers).fill('')
  );

  submitAnswer() {
    const words = this.words()
      .map((w) => w.trim())
      .filter((w) => w);
    if (words.length === 0) {
      this.translateService
        .selectTranslate('participant.answer.please-answer')
        .pipe(take(1))
        .subscribe((message) => {
          this.notificationService.showAdvanced(
            message,
            AdvancedSnackBarTypes.WARNING
          );
        });
      return;
    }
    this.createAnswer
      .mutate({ variables: { roundId: this.roundId(), words } })
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: (r) => {
          const answer = r.data?.createQuestionnaireWordcloudAnswer;
          if (answer) this.answerCreated.emit(answer as Answer);
          const msg = this.translateService.translate(
            'participant.answer.sent'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
        },
      });
  }
}
