import {
  Component,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  model,
} from '@angular/core';
import { MarkdownFeatureset } from '@app/core/services/http/formatting.service';
import { HotkeyAction } from '@app/core/directives/hotkey.directive';
import { Content, ContentType, UserUiSettings } from '@gql/generated/graphql';
import { ContentService } from '@app/core/services/http/content.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { CoreModule } from '@app/core/core.module';
import { NgClass } from '@angular/common';
import { FlexModule } from '@angular/flex-layout';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { LanguageContextDirective } from '@app/core/directives/language-context.directive';
import { AnswerResponseCounts } from '@app/core/models/answer-response-counts';
import { ContentResultsService } from './content-results.service';
import { RESULT_REGISTRY } from './result-registry';
import { VisualizationType } from './visualization/visualization-type';

@Component({
  selector: 'app-content-results',
  templateUrl: './content-results.component.html',
  styleUrls: ['./content-results.component.scss'],
  imports: [
    FlexModule,
    NgClass,
    CoreModule,
    MatIconButton,
    MatTooltip,
    MatIcon,
    RenderedTextComponent,
    TranslocoPipe,
    LanguageContextDirective,
  ],
})
export class ContentResultsComponent {
  private readonly contentService = inject(ContentService);
  private readonly contentResultsService = inject(ContentResultsService);

  content = input.required<Content>();
  active = input(false, { transform: booleanAttribute });
  directShow = input(false, { transform: booleanAttribute });
  showCorrect = input(false, { transform: booleanAttribute });
  language = input<string>();
  settings = model.required<UserUiSettings>();
  isPresentation = input(false, { transform: booleanAttribute });
  isStandalone = input(false, { transform: booleanAttribute });
  allowAnswerModeration = input(false, { transform: booleanAttribute });

  readonly resultComponent = computed(
    () => RESULT_REGISTRY[this.content().formatData.format]
  );

  readonly componentInputs = computed(() => {
    const base = {
      roundId: this.content().activeRound?.id,
      resultsVisible: this.resultsVisible(),
    };
    if (this.content().formatData.format === ContentType.Scale) {
      return { ...base, language: this.language() };
    }
    if (this.content().formatData.format === ContentType.Wordcloud) {
      return {
        ...base,
        contentId: this.content().id,
        rotateWords: !!this.settings().rotateWordcloudItems,
        visualizationType: this.activeWordcloudVisualiation(),
        allowAnswerModeration: this.allowAnswerModeration(),
      };
    }
    if (this.content().formatData.format === ContentType.Choice) {
      return {
        ...base,
        answersDirectlyBelowChart:
          !!this.settings().contentAnswersDirectlyBelowChart,
        visualizationUnitPercent:
          !!this.settings().contentVisualizationUnitPercent,
        isPresentation: this.isPresentation(),
        showCorrect: this.correctRevealed(),
        hasCorrectAnswer: this.content()?.hasCorrectAnswer,
        formatData: this.content().formatData,
        answerCount: this.content().answerCount ?? 0,
      };
    }
    return base;
  });

  resultsVisible = computed(() => this.contentResultsService.resultsVisible());
  correctResultsVisible = linkedSignal(() =>
    this.contentResultsService.correctResultsVisible()
  );

  /** In presentation the reveal is toggled; every other view follows its own entitlement. */
  private readonly correctRevealed = computed(() =>
    this.isPresentation() ? this.correctResultsVisible() : this.showCorrect()
  );

  responseCounts: AnswerResponseCounts = { answers: 0, abstentions: 0 };
  ContentType = ContentType;
  flashcardMarkdownFeatures = MarkdownFeatureset.EXTENDED;
  HotkeyAction = HotkeyAction;
  allowingUnitChange = computed(() =>
    [
      ContentType.Binary,
      ContentType.Scale,
      ContentType.Choice,
      ContentType.Prioritization,
      ContentType.Sort,
      ContentType.Numeric,
    ].includes(this.content().formatData.format)
  );

  activeWordcloudVisualiation =
    this.contentResultsService.activeWordcloudVisualization;
  VisualizationType = VisualizationType;

  constructor() {
    effect(() => {
      if (this.active()) {
        if (this.directShow() != null) {
          setTimeout(() => {
            this.contentResultsService.setResultsVisible(this.directShow());
          });
        }
        if (this.showCorrect() != null) {
          setTimeout(() => {
            this.contentResultsService.setCorrectResultsVisible(
              this.showCorrect()
            );
          });
        }
      }
    });
  }

  toggleAnswers() {
    if (this.content().formatData.format === ContentType.Slide) {
      return;
    }
    this.contentResultsService.setResultsVisible(!this.resultsVisible());
  }

  toggleCorrect() {
    if (this.resultsVisible() && this.content().hasCorrectAnswer) {
      this.contentResultsService.setCorrectResultsVisible(
        !this.correctResultsVisible()
      );
    }
  }

  toggleVisualizationUnit() {
    this.settings.update((s) => ({
      ...s,
      contentVisualizationUnitPercent:
        !this.settings().contentVisualizationUnitPercent,
    }));
  }

  toggleWordcloudView() {
    this.contentResultsService.setActiveWordcloudVizualization(
      this.activeWordcloudVisualiation() === VisualizationType.WORDCLOUD
        ? VisualizationType.TABLE
        : VisualizationType.WORDCLOUD
    );
  }

  updateCounter(counts: AnswerResponseCounts) {
    this.responseCounts = counts;
    if (this.active()) {
      this.contentService.updateAnswerCounts(this.responseCounts);
    }
  }
}
