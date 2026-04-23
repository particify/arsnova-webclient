import {
  Component,
  inject,
  model,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { FormComponent } from '@app/standalone/form/form.component';
import { ContentForm } from '@app/creator/questionnaire/content-editing/content-form';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import {
  CreateQuestionnaireWordcloudContentGql,
  QuestionnaireContentsByQuestionnaireIdDocument,
  QuestionnairesByRoomIdDocument,
  UpdateQuestionnaireWordcloudContentGql,
  WordcloudContentFormatData,
} from '@gql/generated/graphql';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';

const MAX_KEYWORDS = 10;

@Component({
  selector: 'app-wordcloud-content-form',
  templateUrl: './wordcloud-content-form.component.html',
  styleUrls: ['./wordcloud-content-form.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, FormsModule, TranslocoPipe],
})
export class WordcloudContentFormComponent
  extends FormComponent
  implements ContentForm<WordcloudContentFormatData>
{
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslocoService);
  private readonly questionnairePageService = inject(QuestionnairePageService);
  private readonly createWordcloudContent = inject(
    CreateQuestionnaireWordcloudContentGql
  );
  private readonly updateWordcloudContent = inject(
    UpdateQuestionnaireWordcloudContentGql
  );

  formatData = model.required<WordcloudContentFormatData | null>();
  preview = input<boolean>(false);
  contentId = input<string>();
  duration = input<number | null>();
  abstentionsAllowed = input(true);
  maxAnswers = linkedSignal(() => this.formatData()?.maxAnswers ?? 3);
  submitted = output<void>();

  formatDataValid(): boolean {
    if (this.maxAnswers() >= 1 && this.maxAnswers() <= MAX_KEYWORDS) {
      return true;
    } else {
      const msg = this.translateService.translate(
        'creator.content.max-keywords-out-of-range',
        { min: 1, max: MAX_KEYWORDS }
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return false;
    }
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
    this.updateWordcloudContent
      .mutate({
        variables: {
          input: {
            id: contentId,
            body: body,
            duration: this.duration(),
            abstentionsAllowed: this.abstentionsAllowed(),
            maxAnswers: this.maxAnswers(),
          },
        },
      })
      .subscribe({
        next: (r) => {
          const content = r.data?.updateQuestionnaireWordcloudContent;
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
    this.createWordcloudContent
      .mutate({
        variables: {
          input: {
            questionnaireId: questionnaireId,
            body: body,
            maxAnswers: this.maxAnswers(),
            duration: this.duration(),
            abstentionsAllowed: this.abstentionsAllowed(),
          },
        },
        refetchQueries: [
          {
            query: QuestionnaireContentsByQuestionnaireIdDocument,
            variables: { questionnaireId: questionnaireId },
          },
          QuestionnairesByRoomIdDocument,
        ],
      })
      .subscribe({
        next: (r) => {
          if (r.data?.createQuestionnaireWordcloudContent) {
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
