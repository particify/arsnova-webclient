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
import { mutationHelper } from '@gql/helper/mutation-helper';
import { take } from 'rxjs';
import { ContentTextAnswerComponent } from '@app/standalone/content-answers/content-text-answer/content-text-answer.component';
import {
  Answer,
  AnswerResultState,
  CreateQuestionnaireTextAnswerGql,
  TextAnswerFormatData,
  TextContentFormatData,
} from '@gql/generated/graphql';
import { AnswerForm } from '@app/participant/content/answer-form';

@Component({
  selector: 'app-content-text-participant',
  templateUrl: './content-text-participant.component.html',
  imports: [ContentTextAnswerComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [provideTranslocoScope('participant')],
})
export class ContentTextParticipantComponent implements AnswerForm {
  private readonly translateService = inject(TranslocoService);
  private readonly notificationService = inject(NotificationService);
  private readonly createAnswer = inject(CreateQuestionnaireTextAnswerGql);
  private readonly mutations = mutationHelper();

  readonly contentId = input.required<string>();
  readonly roundId = input.required<string>();
  readonly contentFormatData = input.required<TextContentFormatData>();
  readonly answerFormatData = input<TextAnswerFormatData>();
  readonly result = input<AnswerResultState | undefined>(
    AnswerResultState.Unanswered
  );
  readonly correctOptionsPublished = input<boolean>(false);
  readonly answerCreated = output<Answer>();
  readonly answer = linkedSignal(() => this.answerFormatData()?.body ?? '');

  submitAnswer() {
    const body = this.answer().trim();
    if (!body) {
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
      .mutate({ variables: { roundId: this.roundId(), body } })
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: (r) => {
          const answer = r.data?.createQuestionnaireTextAnswer;
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
