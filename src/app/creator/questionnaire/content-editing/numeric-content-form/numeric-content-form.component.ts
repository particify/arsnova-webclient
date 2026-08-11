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
import { FormComponent } from '@app/standalone/form/form.component';
import { ContentForm } from '@app/creator/questionnaire/content-editing/content-form';
import { CoreModule } from '@app/core/core.module';
import {
  CreateQuestionnaireNumericContentGql,
  NumericContentFormatData,
  QuestionnaireContentsByQuestionnaireIdDocument,
  UpdateQuestionnaireNumericContentGql,
} from '@gql/generated/graphql';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';

const MAX_VALUE = 1_000_000_000_000_000;

@Component({
  selector: 'app-numeric-content-form',
  templateUrl: './numeric-content-form.component.html',
  styleUrls: [
    '../content-editing.component.scss',
    './numeric-content-form.component.scss',
  ],
  imports: [CoreModule],
})
export class NumericContentFormComponent
  extends FormComponent
  implements ContentForm<NumericContentFormatData>
{
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslocoService);
  private readonly questionnairePageService = inject(QuestionnairePageService);
  private readonly createNumericContent = inject(
    CreateQuestionnaireNumericContentGql
  );
  private readonly updateNumericContent = inject(
    UpdateQuestionnaireNumericContentGql
  );

  formatData = model.required<NumericContentFormatData | null>();
  preview = input<boolean>(false);
  contentId = input<string>();
  duration = input<number | null>();
  weight = input<number>();
  abstentionsAllowed = input(true);
  answered = input(false);
  hasCorrectAnswer = input(false);
  submitted = output<void>();

  minimum = linkedSignal(() => this.formatData()?.minNumber ?? 1);
  maximum = linkedSignal(() => this.formatData()?.maxNumber ?? 100);
  correctNumber = linkedSignal(
    () => this.formatData()?.correctNumber ?? undefined
  );
  tolerance = linkedSignal(() => this.formatData()?.tolerance || undefined);

  private isMinimumTooLarge(): boolean {
    return this.minimum() < -MAX_VALUE || this.minimum() >= MAX_VALUE;
  }

  private isMaximumTooLarge(): boolean {
    return this.maximum() <= -MAX_VALUE || this.maximum() > MAX_VALUE;
  }

  private isRangeTooLarge(): boolean {
    return this.maximum() - this.minimum() > MAX_VALUE;
  }

  private isCorrectOutOfRange(): boolean {
    const correctNumber = this.correctNumber();
    const tolerance = this.tolerance() ?? 0;
    return (
      correctNumber !== undefined &&
      (correctNumber - tolerance < this.minimum() ||
        correctNumber + tolerance > this.maximum())
    );
  }

  private determineError(): string | undefined {
    if (this.minimum() >= this.maximum()) {
      return 'creator.content.numeric-minimum-has-to-be-lower-than-maximum';
    }
    if (this.isMinimumTooLarge()) {
      return 'creator.content.numeric-minimum-too-large';
    }
    if (this.isMaximumTooLarge()) {
      return 'creator.content.numeric-maximum-too-large';
    }
    if (this.isRangeTooLarge()) {
      return 'creator.content.numeric-range-too-large';
    }
    if (
      this.hasCorrectAnswer() &&
      (this.correctNumber() === undefined || this.isCorrectOutOfRange())
    ) {
      return 'creator.content.select-correct-number-in-defined-range';
    }
    return undefined;
  }

  formatDataValid(): boolean {
    const error = this.determineError();
    if (!error) {
      return true;
    }
    this.notificationService.showAdvanced(
      this.translateService.translate(error, {
        min: -MAX_VALUE,
        max: MAX_VALUE,
        maxRange: MAX_VALUE,
      }),
      AdvancedSnackBarTypes.WARNING
    );
    return false;
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

  private numberInput() {
    const hasCorrectAnswer = this.hasCorrectAnswer();
    return {
      minNumber: this.minimum(),
      maxNumber: this.maximum(),
      correctNumber: hasCorrectAnswer ? (this.correctNumber() ?? null) : null,
      tolerance: hasCorrectAnswer ? (this.tolerance() ?? null) : null,
    };
  }

  private editContent(contentId: string, body: string) {
    this.updateNumericContent
      .mutate({
        variables: {
          input: {
            id: contentId,
            body: body,
            ...this.numberInput(),
            duration: this.duration(),
            weight: this.weight(),
            abstentionsAllowed: this.abstentionsAllowed(),
          },
        },
      })
      .subscribe({
        next: (r) => {
          const content = r.data?.updateQuestionnaireNumericContent;
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
    this.createNumericContent
      .mutate({
        variables: {
          input: {
            questionnaireId: questionnaireId,
            body: body,
            ...this.numberInput(),
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
          if (r.data?.createQuestionnaireNumericContent) {
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
