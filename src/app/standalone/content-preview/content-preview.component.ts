import { Component, computed, inject, input, Type } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { provideTranslocoScope, TranslocoService } from '@jsverse/transloco';
import { AnswerOption, toAnswerOption } from '@app/core/models/answer-option';
import { SelectableAnswer } from '@app/core/models/selectable-answer';
import { CoreModule } from '@app/core/core.module';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { ContentChoiceAnswerComponent } from '@app/standalone/content-answers/content-choice-answer/content-choice-answer.component';
import { ContentNumericAnswerComponent } from '@app/standalone/content-answers/content-numeric-answer/content-numeric-answer.component';
import { LanguageContextDirective } from '@app/core/directives/language-context.directive';
import { LanguageDirectionPipe } from '@app/core/pipes/language-direction.pipe';
import { ContentFormatData, ContentType } from '@gql/generated/graphql';
import { ContentPrioritizationAnswerComponent } from '@app/standalone/content-answers/content-prioritization-answer/content-prioritization-answer.component';
import { ContentTextAnswerComponent } from '@app/standalone/content-answers/content-text-answer/content-text-answer.component';
import { ContentSortAnswerComponent } from '@app/standalone/content-answers/content-sort-answer/content-sort-answer.component';
import { ContentWordcloudAnswerComponent } from '@app/standalone/content-answers/content-wordcloud-answer/content-wordcloud-answer.component';

/** A binary content stores no options, so both labels come from i18n. */
const BINARY_OPTION_KEYS = ['answer.yes', 'answer.no'];

function binaryCorrectOptionIndexes(
  correctAnswer?: boolean | null
): number[] | undefined {
  return correctAnswer === null || correctAnswer === undefined
    ? undefined
    : [correctAnswer ? 0 : 1];
}

@Component({
  selector: 'app-content-preview',
  imports: [
    CoreModule,
    RenderedTextComponent,
    LanguageContextDirective,
    LanguageDirectionPipe,
  ],
  providers: [provideTranslocoScope('creator')],
  templateUrl: './content-preview.component.html',
  styleUrls: ['./content-preview.component.scss'],
})
export class ContentPreviewComponent {
  private readonly translateService = inject(TranslocoService);
  private readonly likertScaleService = inject(LikertScaleService);

  contentFormatData = input.required<ContentFormatData>();
  body = input.required<string>();
  renderAnswersDynamically = input<boolean>(false);
  showTitle = input<boolean>(true);
  language = input<string>();

  /**
   * Follows the active language and waits for its file, so neither a switch
   * nor a slow load leaves the options showing stale labels or raw keys.
   */
  private readonly binaryLabels = toSignal(
    this.translateService.selectTranslate<string[]>(BINARY_OPTION_KEYS),
    { initialValue: [] as string[] }
  );

  readonly answerText = computed(() => {
    const formatData = this.contentFormatData();
    return formatData.__typename === 'FlashcardContentFormatData'
      ? formatData.answer
      : undefined;
  });

  FORM_REGISTRY: Record<ContentType, Type<unknown> | undefined> = {
    [ContentType.Choice]: ContentChoiceAnswerComponent,
    [ContentType.Binary]: ContentChoiceAnswerComponent,
    [ContentType.Flashcard]: undefined,
    [ContentType.Numeric]: ContentNumericAnswerComponent,
    [ContentType.Prioritization]: ContentPrioritizationAnswerComponent,
    [ContentType.Scale]: ContentChoiceAnswerComponent,
    [ContentType.ShortAnswer]: ContentTextAnswerComponent,
    [ContentType.Slide]: undefined,
    [ContentType.Sort]: ContentSortAnswerComponent,
    [ContentType.Text]: ContentTextAnswerComponent,
    [ContentType.Wordcloud]: ContentWordcloudAnswerComponent,
  };

  readonly formatComponent = computed(() => {
    return this.FORM_REGISTRY[this.contentFormatData().format];
  });

  readonly componentInputs = computed(() => {
    const formatData = this.contentFormatData();

    switch (formatData.__typename) {
      case 'BinaryContentFormatData':
        return {
          answerOptions: this.binaryLabels().map(
            (label) => new SelectableAnswer(new AnswerOption(label), false)
          ),
          correctOptionIndexes: binaryCorrectOptionIndexes(
            formatData.correctAnswer
          ),
        };

      case 'ChoiceContentFormatData':
        return {
          answerOptions: formatData.options.map(
            (o) => new SelectableAnswer(toAnswerOption(o), false)
          ),
          correctOptionIndexes: formatData.correctOptionIndexes ?? undefined,
          multipleAnswersAllowed: !!formatData.multiple,
        };

      case 'NumericContentFormatData':
        return {
          minNumber: formatData.minNumber,
          maxNumber: formatData.maxNumber,
          disabled: true,
        };

      case 'PrioritizationContentFormatData':
        return {
          answerOptions: formatData.options,
          assignablePoints: formatData.assignablePoints,
          disabled: true,
        };

      case 'ScaleContentFormatData':
        return this.scaleInputs(formatData.template, formatData.neutralOption);

      case 'SortContentFormatData':
        return {
          answerOptions: formatData.options,
          disabled: true,
        };

      default:
        return this.freeTextInputs(formatData);
    }
  });

  /** Formats answered by typing, which the preview shows empty. */
  private freeTextInputs(formatData: ContentFormatData) {
    switch (formatData.__typename) {
      case 'ShortAnswerContentFormatData':
        return {
          disabled: true,
          minRows: 1,
          lengthLimit: 80,
        };

      case 'TextContentFormatData':
        return {
          disabled: true,
        };

      case 'WordcloudContentFormatData':
        return {
          words: ['', '', ''],
        };

      default:
        return {};
    }
  }

  private scaleInputs(template: string, neutralOption: boolean) {
    const options = this.likertScaleService.getOptions(template, neutralOption);
    return {
      answerOptions: options.labels.map(
        (label) => new SelectableAnswer(new AnswerOption(label), false)
      ),
      translateOptions: options.translate,
      language: this.language(),
    };
  }
}
