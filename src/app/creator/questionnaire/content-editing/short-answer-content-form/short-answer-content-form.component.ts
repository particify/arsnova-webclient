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
import { ContentTextAnswerComponent } from '@app/standalone/content-answers/content-text-answer/content-text-answer.component';
import {
  CreateQuestionnaireShortAnswerContentGql,
  QuestionnaireContentsByQuestionnaireIdDocument,
  ShortAnswerContentFormatData,
  UpdateQuestionnaireShortAnswerContentGql,
} from '@gql/generated/graphql';
import { mutationHelper } from '@gql/helper/mutation-helper';

const TERM_LENGTH_LIMIT = 80;

const NON_ALPHANUMERIC = /[^\p{Alphabetic}\p{Nd}]/gu;

/**
 * Mirrors the server's comparison form, so terms it would reject as blank or
 * as repeating are caught here: lowercase, letters and digits only. Accents
 * are kept, so "Köln" and "Koln" stay different terms.
 */
function normalizeTerm(term: string): string {
  return term.toLowerCase().replace(NON_ALPHANUMERIC, '');
}

function sameTerms(terms: string[], others: string[]): boolean {
  return (
    terms.length === others.length &&
    terms.every((term, i) => term === others[i])
  );
}

@Component({
  selector: 'app-short-answer-content-form',
  templateUrl: './short-answer-content-form.component.html',
  styleUrl: '../content-editing.component.scss',
  imports: [AnswerOptionListComponent, ContentTextAnswerComponent, CoreModule],
})
export class ShortAnswerContentFormComponent implements ContentForm<ShortAnswerContentFormatData> {
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslocoService);
  private readonly questionnairePageService = inject(QuestionnairePageService);
  private readonly mutations = mutationHelper();
  private readonly createShortAnswerContent = inject(
    CreateQuestionnaireShortAnswerContentGql
  );
  private readonly updateShortAnswerContent = inject(
    UpdateQuestionnaireShortAnswerContentGql
  );

  private readonly answerList = viewChild<AnswerOptionListComponent>(
    AnswerOptionListComponent
  );

  formatData = model.required<ShortAnswerContentFormatData | null>();
  preview = input<boolean>(false);
  contentId = input<string>();
  duration = input<number | null>();
  weight = input<number>();
  abstentionsAllowed = input(true);
  answered = input(false);
  submitted = output<void>();

  readonly lengthLimit = TERM_LENGTH_LIMIT;

  readonly displayAnswers = linkedSignal<string[], DisplayAnswer[]>({
    source: () => this.formatData()?.correctTerms ?? [],
    /**
     * linkedSignal re-seeds on any format data change, so the persisted terms
     * are compared by value to keep ones the creator is still typing. Apollo
     * hands out a fresh array whenever the content re-emits.
     */
    computation: (persisted, previous) =>
      previous && sameTerms(persisted, previous.source)
        ? previous.value
        : persisted.map((term) => new DisplayAnswer(term, false)),
  });

  /** The terms decide correctness, so changing them reinterprets old answers. */
  readonly locked = computed(() => !!this.contentId() && this.answered());

  formatDataValid(): boolean {
    // The list is only rendered while editing; entering the preview validated it.
    return (
      this.preview() ||
      ((this.answerList()?.isListValid(false, false) ?? false) &&
        this.areNormalizedTermsValid())
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

  private areNormalizedTermsValid(): boolean {
    const normalizedTerms = this.correctTerms().map(normalizeTerm);
    let msgKey: string | undefined;
    if (normalizedTerms.includes('')) {
      msgKey = 'creator.content.short-answer-term-without-letters-or-digits';
    } else if (new Set(normalizedTerms).size !== normalizedTerms.length) {
      msgKey = 'creator.content.short-answer-terms-repeating';
    }
    if (msgKey) {
      this.notificationService.showAdvanced(
        this.translateService.translate(msgKey),
        AdvancedSnackBarTypes.WARNING
      );
      return false;
    }
    return true;
  }

  private correctTerms(): string[] {
    return this.displayAnswers().map((answer) => answer.option);
  }

  private editContent(contentId: string, body: string) {
    this.updateShortAnswerContent
      .mutate({
        variables: {
          input: {
            id: contentId,
            body: body,
            correctTerms: this.correctTerms(),
            duration: this.duration(),
            weight: this.weight(),
            abstentionsAllowed: this.abstentionsAllowed(),
          },
        },
      })
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: (r) => {
          const content = r.data?.updateQuestionnaireShortAnswerContent;
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
    this.createShortAnswerContent
      .mutate({
        variables: {
          input: {
            questionnaireId: questionnaireId,
            body: body,
            correctTerms: this.correctTerms(),
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
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: (r) => {
          if (r.data?.createQuestionnaireShortAnswerContent) {
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
