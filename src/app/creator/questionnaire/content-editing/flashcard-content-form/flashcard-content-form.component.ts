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
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { mutationHelper } from '@gql/helper/mutation-helper';
import { FormComponent } from '@app/standalone/form/form.component';
import { ContentForm } from '@app/creator/questionnaire/content-editing/content-form';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import {
  CreateQuestionnaireFlashcardContentGql,
  FlashcardContentFormatData,
  QuestionnaireContentsByQuestionnaireIdDocument,
  UpdateQuestionnaireFlashcardContentGql,
} from '@gql/generated/graphql';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { HintComponent } from '@app/standalone/hint/hint.component';
import { HintType } from '@app/core/models/hint-type.enum';

const MAX_ANSWER_LENGTH = 2000;

@Component({
  selector: 'app-flashcard-content-form',
  templateUrl: './flashcard-content-form.component.html',
  styleUrls: ['./flashcard-content-form.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    TranslocoPipe,
    HintComponent,
  ],
})
export class FlashcardContentFormComponent
  extends FormComponent
  implements ContentForm<FlashcardContentFormatData>
{
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslocoService);
  private readonly questionnairePageService = inject(QuestionnairePageService);
  private readonly mutations = mutationHelper();
  private readonly formattingService = inject(FormattingService);
  private readonly createFlashcardContent = inject(
    CreateQuestionnaireFlashcardContentGql
  );
  private readonly updateFlashcardContent = inject(
    UpdateQuestionnaireFlashcardContentGql
  );

  formatData = model.required<FlashcardContentFormatData | null>();
  preview = input<boolean>(false);
  contentId = input<string>();
  duration = input<number | null>();
  abstentionsAllowed = input(true);
  answer = linkedSignal(() => this.formatData()?.answer ?? '');
  submitted = output<void>();

  answerMaxLength = MAX_ANSWER_LENGTH;
  textContainsImage = false;
  HintType = HintType;

  updateTextContainsImage(text: string) {
    this.textContainsImage = this.formattingService.containsTextAnImage(text);
  }

  formatDataValid(): boolean {
    if (this.answer().trim()) {
      return true;
    }
    const msg = this.translateService.translate(
      'creator.content.no-empty-fields-allowed'
    );
    this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
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

  private editContent(contentId: string, body: string) {
    this.updateFlashcardContent
      .mutate({
        variables: {
          input: {
            id: contentId,
            body: body,
            answer: this.answer(),
          },
        },
      })
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: (r) => {
          const content = r.data?.updateQuestionnaireFlashcardContent;
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
    this.createFlashcardContent
      .mutate({
        variables: {
          input: {
            questionnaireId: questionnaireId,
            body: body,
            answer: this.answer(),
          },
        },
        refetchQueries: [
          {
            query: QuestionnaireContentsByQuestionnaireIdDocument,
            variables: { questionnaireId: questionnaireId },
          },
        ],
      })
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: (r) => {
          if (r.data?.createQuestionnaireFlashcardContent) {
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
