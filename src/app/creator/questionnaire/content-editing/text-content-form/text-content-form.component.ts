import { Component, inject, input, model, output } from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@jsverse/transloco';
import { mutationHelper } from '@gql/helper/mutation-helper';
import { FormComponent } from '@app/standalone/form/form.component';
import { ContentForm } from '@app/creator/questionnaire/content-editing/content-form';
import {
  CreateQuestionnaireTextContentGql,
  QuestionnaireContentsByQuestionnaireIdDocument,
  TextContentFormatData,
  UpdateQuestionnaireTextContentGql,
} from '@gql/generated/graphql';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';

@Component({
  selector: 'app-text-content-form',
  template: '',
  imports: [],
})
export class TextContentFormComponent
  extends FormComponent
  implements ContentForm<TextContentFormatData>
{
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslocoService);
  private readonly questionnairePageService = inject(QuestionnairePageService);
  private readonly mutations = mutationHelper();
  private readonly createTextContent = inject(
    CreateQuestionnaireTextContentGql
  );
  private readonly updateTextContent = inject(
    UpdateQuestionnaireTextContentGql
  );

  formatData = model.required<TextContentFormatData | null>();
  preview = input<boolean>(false);
  contentId = input<string>();
  duration = input<number | null>();
  abstentionsAllowed = input(true);
  submitted = output<void>();

  formatDataValid(): boolean {
    return true;
  }

  submit(questionnaireId: string, body: string) {
    const contentId = this.contentId();
    if (contentId) {
      this.editContent(contentId, body);
    } else {
      this.createContent(questionnaireId, body);
    }
  }

  private editContent(contentId: string, body: string) {
    this.updateTextContent
      .mutate({
        variables: {
          input: {
            id: contentId,
            body: body,
            duration: this.duration(),
            abstentionsAllowed: this.abstentionsAllowed(),
          },
        },
      })
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: (r) => {
          const content = r.data?.updateQuestionnaireTextContent;
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
    this.createTextContent
      .mutate({
        variables: {
          input: {
            questionnaireId: questionnaireId,
            body: body,
            duration: this.duration(),
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
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: (r) => {
          if (r.data?.createQuestionnaireTextContent) {
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
