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
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, skip, switchMap } from 'rxjs';
import { onlyCompleteData } from 'apollo-angular';
import { refetchOn } from '@gql/helper/refetch-on';
import { HotkeyAction } from '@app/core/directives/hotkey.directive';
import {
  Content,
  ContentType,
  QuestionnaireRoundsByContentIdGql,
  UserUiSettings,
} from '@gql/generated/graphql';
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
import { RoundSelectorComponent } from '@app/standalone/round-selector/round-selector.component';
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
    RoundSelectorComponent,
  ],
})
export class ContentResultsComponent {
  private readonly contentService = inject(ContentService);
  private readonly contentResultsService = inject(ContentResultsService);
  private readonly questionnaireRoundsByContentId = inject(
    QuestionnaireRoundsByContentIdGql
  );

  content = input.required<Content>();
  active = input(false, { transform: booleanAttribute });
  directShow = input(false, { transform: booleanAttribute });
  showCorrect = input(false, { transform: booleanAttribute });
  language = input<string>();
  settings = model.required<UserUiSettings>();
  isPresentation = input(false, { transform: booleanAttribute });
  isStandalone = input(false, { transform: booleanAttribute });
  allowAnswerModeration = input(false, { transform: booleanAttribute });
  viewAsParticipant = input(false, { transform: booleanAttribute });

  private readonly activeRoundId$ = toObservable(
    computed(() => this.content().activeRound?.id)
  );

  readonly rounds = toSignal(
    toObservable(computed(() => this.content().id)).pipe(
      switchMap((contentId) =>
        // A round started elsewhere, e.g. from a second screen, only shows up
        // as the content's new active round.
        refetchOn(
          this.questionnaireRoundsByContentId.watch({
            variables: { contentId },
          }),
          this.activeRoundId$.pipe(skip(1))
        )
      ),
      onlyCompleteData(),
      map((r) => r.data.questionnaireRoundsByContentId ?? [])
    ),
    { initialValue: [] }
  );

  readonly defaultRoundId = computed(() => {
    const rounds = this.rounds();
    return rounds.length ? rounds[rounds.length - 1].id : undefined;
  });

  readonly selectedRoundIds = linkedSignal(() => {
    if (this.isPresentation()) {
      const presentationRoundIds =
        this.contentResultsService.presentationSelectedRoundIds(
          this.content().id
        );
      if (presentationRoundIds?.length) {
        return presentationRoundIds;
      }
    }
    const defaultRoundId = this.defaultRoundId();
    return defaultRoundId ? [defaultRoundId] : [];
  });

  readonly resultComponent = computed(
    () => RESULT_REGISTRY[this.content().formatData.format]
  );

  readonly allowRoundComparison = computed(
    () => !!this.resultComponent().supportsRoundComparison
  );

  private readonly scoringInputs = computed(() => ({
    rounds: this.rounds(),
    visualizationUnitPercent: !!this.settings().contentVisualizationUnitPercent,
    isPresentation: this.isPresentation(),
    showCorrect: this.correctRevealed(),
    hasCorrectAnswer: this.content()?.hasCorrectAnswer,
    formatData: this.content().formatData,
    answerCount: this.content().answerCount ?? 0,
    correctAnswerCount: this.content().correctAnswerCount ?? 0,
    abstentionCount: this.content().abstentionCount ?? 0,
  }));

  private readonly formatInputs: Partial<
    Record<ContentType, () => Record<string, unknown>>
  > = {
    [ContentType.Choice]: () => ({
      ...this.scoringInputs(),
      answersDirectlyBelowChart:
        !!this.settings().contentAnswersDirectlyBelowChart,
      activeRoundId: this.content().activeRound?.id,
    }),
    [ContentType.Flashcard]: () => ({ formatData: this.content().formatData }),
    [ContentType.Numeric]: () => this.scoringInputs(),
    [ContentType.Scale]: () => ({
      rounds: this.rounds(),
      formatData: this.content().formatData,
      visualizationUnitPercent:
        !!this.settings().contentVisualizationUnitPercent,
      isPresentation: this.isPresentation(),
      language: this.language(),
    }),
    [ContentType.Text]: () => ({
      formatData: this.content().formatData,
      allowAnswerModeration: this.allowAnswerModeration(),
      viewAsParticipant: this.viewAsParticipant(),
    }),
    [ContentType.Wordcloud]: () => ({
      contentId: this.content().id,
      rotateWords: !!this.settings().rotateWordcloudItems,
      visualizationType: this.activeWordcloudVisualiation(),
      allowAnswerModeration: this.allowAnswerModeration(),
    }),
  };

  readonly componentInputs = computed<Record<string, unknown>>(() => ({
    roundIds: this.selectedRoundIds(),
    resultsVisible: this.resultsVisible(),
    ...(this.formatInputs[this.content().formatData.format]?.() ?? {
      rounds: this.rounds(),
    }),
  }));

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
