import {
  Component,
  inject,
  input,
  linkedSignal,
  model,
  output,
} from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@jsverse/transloco';
import { CoreModule } from '@app/core/core.module';
import { FormComponent } from '@app/standalone/form/form.component';
import { ContentForm } from '@app/creator/questionnaire/content-editing/content-form';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import {
  BinaryContentFormatData,
  CreateQuestionnaireBinaryContentGql,
  QuestionnaireContentsByQuestionnaireIdDocument,
  UpdateQuestionnaireBinaryContentGql,
} from '@gql/generated/graphql';

@Component({
  selector: 'app-binary-content-form',
  templateUrl: './binary-content-form.component.html',
  styleUrls: [
    '../content-editing.component.scss',
    './binary-content-form.component.scss',
  ],
  imports: [CoreModule],
})
export class BinaryContentFormComponent
  extends FormComponent
  implements ContentForm<BinaryContentFormatData>
{
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslocoService);
  private readonly questionnairePageService = inject(QuestionnairePageService);
  private readonly createBinaryContent = inject(
    CreateQuestionnaireBinaryContentGql
  );
  private readonly updateBinaryContent = inject(
    UpdateQuestionnaireBinaryContentGql
  );

  formatData = model.required<BinaryContentFormatData | null>();
  preview = input<boolean>(false);
  contentId = input<string>();
  duration = input<number | null>();
  weight = input<number>();
  abstentionsAllowed = input(true);
  answered = input(false);
  hasCorrectAnswer = input(false);
  submitted = output<void>();

  readonly correctAnswer = linkedSignal<
    boolean | null | undefined,
    boolean | undefined
  >({
    source: () => this.formatData()?.correctAnswer,
    /**
     * linkedSignal re-seeds on any format data change, so the persisted answer
     * is compared explicitly to keep one the creator just picked.
     */
    computation: (persisted, previous) =>
      previous && persisted === previous.source
        ? previous.value
        : (persisted ?? undefined),
  });

  formatDataValid(): boolean {
    if (this.hasCorrectAnswer() && this.correctAnswer() === undefined) {
      this.notificationService.showAdvanced(
        this.translateService.translate('creator.content.select-one'),
        AdvancedSnackBarTypes.WARNING
      );
      return false;
    }
    return true;
  }

  submit(questionnaireId: string, body: string) {
    if (this.formatDataValid()) {
      const contentId = this.contentId();
      if (contentId) {
        this.editContent(contentId, body);
      } else {
        this.createContent(questionnaireId, body);
      }
    }
  }

  private correctAnswerInput(): boolean | null {
    return this.hasCorrectAnswer() ? (this.correctAnswer() ?? null) : null;
  }

  private editContent(contentId: string, body: string) {
    this.updateBinaryContent
      .mutate({
        variables: {
          input: {
            id: contentId,
            body: body,
            correctAnswer: this.correctAnswerInput(),
            duration: this.duration(),
            weight: this.weight(),
            abstentionsAllowed: this.abstentionsAllowed(),
          },
        },
      })
      .subscribe({
        next: (r) => {
          const content = r.data?.updateQuestionnaireBinaryContent;
          if (content) {
            const msg = this.translateService.translate(
              'creator.content.changes-made'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
            this.questionnairePageService.updateEditedContent(content);
          }
        },
      });
  }

  private createContent(questionnaireId: string, body: string) {
    this.createBinaryContent
      .mutate({
        variables: {
          input: {
            questionnaireId: questionnaireId,
            body: body,
            correctAnswer: this.correctAnswerInput(),
            duration: this.duration(),
            weight: this.weight(),
            abstentionsAllowed: this.abstentionsAllowed(),
          },
        },
        refetchQueries: [
          {
            query: QuestionnaireContentsByQuestionnaireIdDocument,
            variables: { questionnaireId: questionnaireId },
          },
        ],
      })
      .subscribe({
        next: (r) => {
          if (r.data?.createQuestionnaireBinaryContent) {
            const msg = this.translateService.translate(
              'creator.content.submitted'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
            this.submitted.emit();
          }
        },
      });
  }
}
