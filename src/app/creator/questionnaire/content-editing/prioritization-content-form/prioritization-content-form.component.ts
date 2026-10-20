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
import { ContentPrioritizationAnswerComponent } from '@app/standalone/content-answers/content-prioritization-answer/content-prioritization-answer.component';
import {
  CreateQuestionnairePrioritizationContentGql,
  PrioritizationContentFormatData,
  QuestionnaireContentsByQuestionnaireIdDocument,
  UpdateQuestionnairePrioritizationContentGql,
} from '@gql/generated/graphql';
import { mutationHelper } from '@gql/helper/mutation-helper';

function sameItems(labels: string[], others: string[]): boolean {
  return (
    labels.length === others.length &&
    labels.every((label, i) => label === others[i])
  );
}

@Component({
  selector: 'app-prioritization-content-form',
  templateUrl: './prioritization-content-form.component.html',
  styleUrl: '../content-editing.component.scss',
  imports: [
    AnswerOptionListComponent,
    ContentPrioritizationAnswerComponent,
    CoreModule,
  ],
})
export class PrioritizationContentFormComponent implements ContentForm<PrioritizationContentFormatData> {
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslocoService);
  private readonly questionnairePageService = inject(QuestionnairePageService);
  private readonly mutations = mutationHelper();
  private readonly createPrioritizationContent = inject(
    CreateQuestionnairePrioritizationContentGql
  );
  private readonly updatePrioritizationContent = inject(
    UpdateQuestionnairePrioritizationContentGql
  );

  private readonly answerList = viewChild<AnswerOptionListComponent>(
    AnswerOptionListComponent
  );

  formatData = model.required<PrioritizationContentFormatData | null>();
  preview = input<boolean>(false);
  contentId = input<string>();
  duration = input<number | null>();
  abstentionsAllowed = input(true);
  answered = input(false);
  submitted = output<void>();

  readonly displayAnswers = linkedSignal<string[], DisplayAnswer[]>({
    source: () =>
      this.formatData()?.options.map((option) => option.label) ?? [],
    /**
     * linkedSignal re-seeds on any format data change, so the persisted items
     * are compared by value to keep ones the creator is still typing. Apollo
     * hands out a fresh array whenever the content re-emits.
     */
    computation: (persisted, previous) =>
      previous && sameItems(persisted, previous.source)
        ? previous.value
        : persisted.map((label) => new DisplayAnswer(label, false)),
  });

  /** An answer assigns its points by item index, so editing reattributes them. */
  readonly locked = computed(() => !!this.contentId() && this.answered());

  readonly previewItems = computed(() =>
    this.displayAnswers().map((answer) => ({ label: answer.option }))
  );

  /** The server owns the budget, so a content still being created has none. */
  readonly assignablePoints = computed(
    () => this.formatData()?.assignablePoints ?? 0
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
    this.updatePrioritizationContent
      .mutate({
        variables: {
          input: {
            id: contentId,
            body: body,
            options: this.options(),
            duration: this.duration(),
            abstentionsAllowed: this.abstentionsAllowed(),
          },
        },
      })
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: (r) => {
          const content = r.data?.updateQuestionnairePrioritizationContent;
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
    this.createPrioritizationContent
      .mutate({
        variables: {
          input: {
            questionnaireId: questionnaireId,
            body: body,
            options: this.options(),
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
          if (r.data?.createQuestionnairePrioritizationContent) {
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
