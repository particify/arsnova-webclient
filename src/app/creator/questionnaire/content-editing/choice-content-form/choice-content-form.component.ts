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
import { DisplayAnswer } from '@app/creator/questionnaire/content-editing/_models/display-answer';
import { AnswerOptionListComponent } from '@app/creator/questionnaire/content-editing/answer-option-list/answer-option-list.component';
import { ContentService } from '@app/core/services/http/content.service';
import { FlexModule } from '@angular/flex-layout';
import { CoreModule } from '@app/core/core.module';
import {
  ChoiceContentFormatData,
  CreateQuestionnaireChoiceContentGql,
  QuestionnaireContentsByQuestionnaireIdDocument,
  QuestionnairesByRoomIdDocument,
  UpdateQuestionnaireChoiceContentGql,
} from '@gql/generated/graphql';
import { ContentForm } from '@app/creator/questionnaire/content-editing/content-form';
import { TranslocoService } from '@jsverse/transloco';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import { ContentChoiceAnswerComponent } from '@app/standalone/content-answers/content-choice-answer/content-choice-answer.component';
import { SelectableAnswer } from '@app/core/models/selectable-answer';
import { AnswerOption } from '@app/core/models/answer-option';

@Component({
  selector: 'app-choice-content-form',
  templateUrl: './choice-content-form.component.html',
  styleUrl: '../content-editing.component.scss',
  imports: [
    FlexModule,
    AnswerOptionListComponent,
    CoreModule,
    ContentChoiceAnswerComponent,
  ],
})
export class ChoiceContentFormComponent implements ContentForm<ChoiceContentFormatData> {
  private contentService = inject(ContentService);
  private readonly createChoiceContent = inject(
    CreateQuestionnaireChoiceContentGql
  );
  private readonly updateChoiceContent = inject(
    UpdateQuestionnaireChoiceContentGql
  );
  private readonly translateService = inject(TranslocoService);
  private readonly notificationService = inject(NotificationService);
  private readonly questionnairePageService = inject(QuestionnairePageService);

  private readonly answerList = viewChild<AnswerOptionListComponent>(
    AnswerOptionListComponent
  );

  submitted = output<void>();

  formatData = model.required<ChoiceContentFormatData | null>();
  preview = input<boolean>(false);

  displayAnswers = linkedSignal(() =>
    this.contentService.getAnswerOptions(
      this.formatData()?.options.map((o) => o.label) ?? [],
      this.formatData()?.correctOptionIndexes ?? undefined
    )
  );
  correctOptions = linkedSignal(
    () => this.formatData()?.correctOptionIndexes ?? []
  );
  selectableAnswers = computed(() =>
    this.displayAnswers().map((d) => {
      return new SelectableAnswer(new AnswerOption(d.option), false);
    })
  );
  answered = input(false);
  contentId = input<string>();
  hasCorrectAnswer = input(false);
  multiple = input(false);
  weight = input<number>();
  duration = input<number | null>();
  abstentionsAllowed = input(true);

  private get correctOptionIndexes() {
    if (!this.hasCorrectAnswer()) {
      return null;
    }
    const correctOptionIndexes = this.displayAnswers().flatMap((o, i) =>
      o.correct ? [i] : []
    );
    return correctOptionIndexes.length > 0 ? correctOptionIndexes : null;
  }

  private editContent(contentId: string, body: string) {
    this.updateChoiceContent
      .mutate({
        variables: {
          input: {
            id: contentId,
            body: body,
            options: this.displayAnswers().map((d) => d.option),
            correctOptionIndexes: this.correctOptionIndexes,
            multiple: this.multiple(),
            duration: this.duration(),
            weight: this.weight(),
            abstentionsAllowed: this.abstentionsAllowed(),
          },
        },
      })
      .subscribe({
        next: (r) => {
          const content = r.data?.updateQuestionnaireChoiceContent;
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
    this.createChoiceContent
      .mutate({
        variables: {
          input: {
            questionnaireId: questionnaireId,
            body: body,
            options: this.displayAnswers().map((d) => d.option),
            correctOptionIndexes: this.correctOptionIndexes,
            multiple: this.multiple(),
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
          QuestionnairesByRoomIdDocument,
        ],
      })
      .subscribe({
        next: (r) => {
          if (r.data?.createQuestionnaireChoiceContent) {
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

  onAnswersChange(answers: DisplayAnswer[]) {
    this.displayAnswers.set(answers);
  }

  formatDataValid(): boolean {
    return (
      this.answerList()?.isListValid(
        this.hasCorrectAnswer(),
        this.multiple()
      ) ?? false
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
}
