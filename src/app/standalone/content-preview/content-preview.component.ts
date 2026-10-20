import { Component, input, computed, Type } from '@angular/core';
import { provideTranslocoScope } from '@jsverse/transloco';
import { SelectableAnswer } from '@app/core/models/selectable-answer';
import { toAnswerOption } from '@app/core/models/answer-option';
import { CoreModule } from '@app/core/core.module';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { ContentChoiceAnswerComponent } from '@app/standalone/content-answers/content-choice-answer/content-choice-answer.component';
import { LanguageContextDirective } from '@app/core/directives/language-context.directive';
import { LanguageDirectionPipe } from '@app/core/pipes/language-direction.pipe';
import { ContentFormatData, ContentType } from '@gql/generated/graphql';
import { ContentTextAnswerComponent } from '@app/standalone/content-answers/content-text-answer/content-text-answer.component';
import { ContentWordcloudAnswerComponent } from '@app/standalone/content-answers/content-wordcloud-answer/content-wordcloud-answer.component';

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
  contentFormatData = input.required<ContentFormatData>();
  body = input.required<string>();
  renderAnswersDynamically = input<boolean>(false);
  showTitle = input<boolean>(true);
  language = input<string>();

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
    [ContentType.Numeric]: ContentChoiceAnswerComponent,
    [ContentType.Prioritization]: ContentChoiceAnswerComponent,
    [ContentType.Scale]: ContentChoiceAnswerComponent,
    [ContentType.ShortAnswer]: ContentChoiceAnswerComponent,
    [ContentType.Slide]: undefined,
    [ContentType.Sort]: ContentChoiceAnswerComponent,
    [ContentType.Text]: ContentTextAnswerComponent,
    [ContentType.Wordcloud]: ContentWordcloudAnswerComponent,
  };

  readonly formatComponent = computed(() => {
    return this.FORM_REGISTRY[this.contentFormatData().format];
  });

  readonly componentInputs = computed(() => {
    const formatData = this.contentFormatData();

    switch (formatData.__typename) {
      case 'ChoiceContentFormatData':
        return {
          answerOptions: formatData.options.map(
            (o) => new SelectableAnswer(toAnswerOption(o), false)
          ),
          correctOptionIndexes: formatData.correctOptionIndexes ?? undefined,
          multipleAnswersAllowed: !!formatData.multiple,
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
  });
}
