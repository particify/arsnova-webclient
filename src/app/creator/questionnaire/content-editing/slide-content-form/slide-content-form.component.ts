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
  CreateQuestionnaireSlideContentGql,
  QuestionnaireContentsByQuestionnaireIdDocument,
  SlideContentFormatData,
  UpdateQuestionnaireSlideContentGql,
} from '@gql/generated/graphql';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';

@Component({
  selector: 'app-slide-content-form',
  template: '',
  imports: [],
})
export class SlideContentFormComponent
  extends FormComponent
  implements ContentForm<SlideContentFormatData>
{
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslocoService);
  private readonly questionnairePageService = inject(QuestionnairePageService);
  private readonly mutations = mutationHelper();
  private readonly createSlideContent = inject(
    CreateQuestionnaireSlideContentGql
  );
  private readonly updateSlideContent = inject(
    UpdateQuestionnaireSlideContentGql
  );

  formatData = model.required<SlideContentFormatData | null>();
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
    this.updateSlideContent
      .mutate({
        variables: {
          input: {
            id: contentId,
            body: body,
          },
        },
      })
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: (r) => {
          const content = r.data?.updateQuestionnaireSlideContent;
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
    this.createSlideContent
      .mutate({
        variables: {
          input: {
            questionnaireId: questionnaireId,
            body: body,
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
          if (r.data?.createQuestionnaireSlideContent) {
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
