import {
  Component,
  computed,
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
import { mutationHelper } from '@gql/helper/mutation-helper';
import { CoreModule } from '@app/core/core.module';
import { AnswerOption } from '@app/core/models/answer-option';
import { SelectableAnswer } from '@app/core/models/selectable-answer';
import { LIKERT_SCALE_TEMPLATES } from '@app/core/models/likert-scale-template.enum';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { ContentChoiceAnswerComponent } from '@app/standalone/content-answers/content-choice-answer/content-choice-answer.component';
import { ContentForm } from '@app/creator/questionnaire/content-editing/content-form';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import {
  CreateQuestionnaireScaleContentGql,
  QuestionnaireContentsByQuestionnaireIdDocument,
  ScaleContentFormatData,
  ScaleContentTemplate,
  UpdateQuestionnaireScaleContentGql,
} from '@gql/generated/graphql';

@Component({
  selector: 'app-scale-content-form',
  templateUrl: './scale-content-form.component.html',
  styleUrls: [
    '../content-editing.component.scss',
    './scale-content-form.component.scss',
  ],
  imports: [CoreModule, ContentChoiceAnswerComponent],
})
export class ScaleContentFormComponent
  extends FormComponent
  implements ContentForm<ScaleContentFormatData>
{
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslocoService);
  private readonly questionnairePageService = inject(QuestionnairePageService);
  private readonly likertScaleService = inject(LikertScaleService);
  private readonly mutations = mutationHelper();
  private readonly createScaleContent = inject(
    CreateQuestionnaireScaleContentGql
  );
  private readonly updateScaleContent = inject(
    UpdateQuestionnaireScaleContentGql
  );

  formatData = model.required<ScaleContentFormatData | null>();
  preview = input<boolean>(false);
  contentId = input<string>();
  duration = input<number | null>();
  abstentionsAllowed = input(true);
  answered = input(false);
  language = input<string>();
  neutralOption = input(true);
  submitted = output<void>();

  /** The generated enum shares these values but not their type. */
  readonly templates = LIKERT_SCALE_TEMPLATES.map(
    (template) => template as string as ScaleContentTemplate
  );
  readonly template = linkedSignal<
    ScaleContentTemplate | undefined,
    ScaleContentTemplate
  >({
    source: () => this.formatData()?.template ?? undefined,
    /**
     * linkedSignal re-seeds on any format data change, so the persisted
     * template is compared explicitly to keep one the creator just picked.
     */
    computation: (persisted, previous) =>
      previous && persisted === previous.source
        ? previous.value
        : (persisted ?? previous?.value ?? ScaleContentTemplate.Agreement),
  });

  /** A rating indexes the options, so moving them reinterprets old answers. */
  readonly locked = computed(() => !!this.contentId() && this.answered());

  private readonly options = computed(() =>
    this.likertScaleService.getOptions(this.template(), this.neutralOption())
  );
  readonly optionLabels = computed(() => this.options().labels);
  readonly translateLabels = computed(() => this.options().translate);
  /** Translated by the preview, into the room's language rather than the UI's. */
  readonly selectableAnswers = computed(() =>
    this.optionLabels().map(
      (label) => new SelectableAnswer(new AnswerOption(label), false)
    )
  );

  templateLabel(template: ScaleContentTemplate): string {
    return (
      'creator.option-template.' + template.toLowerCase().replace(/_/g, '-')
    );
  }

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
    this.updateScaleContent
      .mutate({
        variables: {
          input: {
            id: contentId,
            body: body,
            template: this.template(),
            neutralOption: this.neutralOption(),
            duration: this.duration(),
            abstentionsAllowed: this.abstentionsAllowed(),
          },
        },
      })
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: (r) => {
          const content = r.data?.updateQuestionnaireScaleContent;
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
    this.createScaleContent
      .mutate({
        variables: {
          input: {
            questionnaireId: questionnaireId,
            body: body,
            template: this.template(),
            neutralOption: this.neutralOption(),
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
          if (r.data?.createQuestionnaireScaleContent) {
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
