import {
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  output,
  viewChild,
} from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@jsverse/transloco';
import { CoreModule } from '@app/core/core.module';
import { DisplayAnswer } from '@app/creator/questionnaire/content-editing/_models/display-answer';
import { AnswerOptionListComponent } from '@app/creator/questionnaire/content-editing/answer-option-list/answer-option-list.component';
import { ContentForm } from '@app/creator/questionnaire/content-editing/content-form';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import { ContentSortAnswerComponent } from '@app/standalone/content-answers/content-sort-answer/content-sort-answer.component';
import {
  CreateQuestionnaireSortContentGql,
  QuestionnaireContentsByQuestionnaireIdDocument,
  SortContentFormatData,
  UpdateQuestionnaireSortContentGql,
} from '@gql/generated/graphql';

function sameOrder(labels: string[], others: string[]): boolean {
  return (
    labels.length === others.length &&
    labels.every((label, i) => label === others[i])
  );
}

/**
 * The options are stored shuffled; the correct order, as the creator arranged
 * it, is their positions in storage.
 */
function creatorOrder(formatData: SortContentFormatData | null): string[] {
  const options = formatData?.options ?? [];
  const correctOrder = formatData?.correctOrder;
  return (correctOrder ? correctOrder.map((i) => options[i]) : options).map(
    (option) => option.label
  );
}

@Component({
  selector: 'app-sort-content-form',
  templateUrl: './sort-content-form.component.html',
  styleUrl: '../content-editing.component.scss',
  imports: [AnswerOptionListComponent, ContentSortAnswerComponent, CoreModule],
})
export class SortContentFormComponent implements ContentForm<SortContentFormatData> {
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslocoService);
  private readonly questionnairePageService = inject(QuestionnairePageService);
  private readonly createSortContent = inject(
    CreateQuestionnaireSortContentGql
  );
  private readonly updateSortContent = inject(
    UpdateQuestionnaireSortContentGql
  );

  private readonly answerList = viewChild<AnswerOptionListComponent>(
    AnswerOptionListComponent
  );

  formatData = model.required<SortContentFormatData | null>();
  preview = input<boolean>(false);
  contentId = input<string>();
  duration = input<number | null>();
  weight = input<number>();
  abstentionsAllowed = input(true);
  answered = input(false);
  submitted = output<void>();

  readonly displayAnswers = linkedSignal<string[], DisplayAnswer[]>({
    source: () => creatorOrder(this.formatData()),
    /**
     * linkedSignal re-seeds on any format data change, so the persisted items
     * are compared by value to keep ones the creator is still typing or has
     * just dragged. Apollo hands out a fresh array whenever the content
     * re-emits.
     */
    computation: (persisted, previous) =>
      previous && sameOrder(persisted, previous.source)
        ? previous.value
        : persisted.map((label) => new DisplayAnswer(label, false)),
  });

  /** The item order is the correct answer, so changing it reinterprets old ones. */
  readonly locked = computed(() => !!this.contentId() && this.answered());

  readonly previewItems = computed(() =>
    this.displayAnswers().map((answer) => ({ label: answer.option }))
  );

  formatDataValid(): boolean {
    // The list is only rendered while editing; entering the preview validated it.
    return (
      this.preview() || (this.answerList()?.isListValid(false, false) ?? false)
    );
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

  private options(): string[] {
    return this.displayAnswers().map((answer) => answer.option);
  }

  private editContent(contentId: string, body: string) {
    this.updateSortContent
      .mutate({
        variables: {
          input: {
            id: contentId,
            body: body,
            options: this.options(),
            duration: this.duration(),
            weight: this.weight(),
            abstentionsAllowed: this.abstentionsAllowed(),
          },
        },
      })
      .subscribe({
        next: (r) => {
          const content = r.data?.updateQuestionnaireSortContent;
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
    this.createSortContent
      .mutate({
        variables: {
          input: {
            questionnaireId: questionnaireId,
            body: body,
            options: this.options(),
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
          if (r.data?.createQuestionnaireSortContent) {
            const msg = this.translateService.translate(
              'creator.content.submitted'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
            this.displayAnswers.set([]);
            this.submitted.emit();
          }
        },
      });
  }
}
