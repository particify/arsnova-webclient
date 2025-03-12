import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { StatisticChoiceComponent } from '@app/standalone/statistic-content/statistic-choice/statistic-choice.component';
import { StatisticTextComponent } from '@app/standalone/statistic-content/statistic-text/statistic-text.component';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentChoice } from '@app/core/models/content-choice';
import { StatisticSortComponent } from '@app/standalone/statistic-content/statistic-sort/statistic-sort.component';
import { MarkdownFeatureset } from '@app/core/services/http/formatting.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { StatisticWordcloudComponent } from '@app/standalone/statistic-content/statistic-wordcloud/statistic-wordcloud.component';
import { StatisticScaleComponent } from '@app/standalone/statistic-content/statistic-scale/statistic-scale.component';
import { HotkeyAction } from '@app/core/directives/hotkey.directive';
import { RouterLink } from '@angular/router';
import { UserSettings } from '@app/core/models/user-settings';
import { StatisticPrioritizationComponent } from '@app/standalone/statistic-content/statistic-prioritization/statistic-prioritization.component';
import { Content } from '@app/core/models/content';
import { ContentFlashcard } from '@app/core/models/content-flashcard';
import { ContentPrioritization } from '@app/core/models/content-prioritization';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { Subject, takeUntil } from 'rxjs';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentNumeric } from '@app/core/models/content-numeric';
import { StatisticNumericComponent } from '@app/standalone/statistic-content/statistic-numeric/statistic-numeric.component';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { CoreModule } from '@app/core/core.module';
import { NgClass } from '@angular/common';
import { FlexModule } from '@angular/flex-layout';
import { AnswerCountComponent } from '@app/standalone/answer-count/answer-count.component';
import { MultipleRoundSelectionComponent } from '@app/standalone/multiple-round-selection/multiple-round-selection.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { LanguageContextDirective } from '@app/core/directives/language-context.directive';
import { StatisticShortAnswerComponent } from '@app/standalone/statistic-content/statistic-short-answer/statistic-short-answer.component';
import { CountComponent } from '@app/standalone/count/count.component';
import { AnswerResponseCounts } from '@app/core/models/answer-response-counts';

@Component({
  selector: 'app-content-results',
  templateUrl: './content-results.component.html',
  styleUrls: ['./content-results.component.scss'],
  imports: [
    FlexModule,
    NgClass,
    CoreModule,
    AnswerCountComponent,
    MultipleRoundSelectionComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
    RenderedTextComponent,
    ExtensionPointModule,
    StatisticChoiceComponent,
    StatisticScaleComponent,
    StatisticTextComponent,
    StatisticSortComponent,
    StatisticWordcloudComponent,
    StatisticPrioritizationComponent,
    StatisticNumericComponent,
    StatisticShortAnswerComponent,
    MatDivider,
    TranslocoPipe,
    LanguageContextDirective,
    RouterLink,
    CountComponent,
  ],
})
export class ContentResultsComponent implements OnInit, OnDestroy {
  // TODO: non-null assertion operator is used here temporaly. We need to make this component generic with a future refactoring.
  @ViewChild(StatisticChoiceComponent)
  choiceStatistic!: StatisticChoiceComponent;
  @ViewChild(StatisticScaleComponent) scaleStatistic!: StatisticScaleComponent;
  @ViewChild(StatisticTextComponent) textStatistic!: StatisticTextComponent;
  @ViewChild(StatisticSortComponent) sortStatistic!: StatisticSortComponent;
  @ViewChild(StatisticWordcloudComponent)
  wordcloudStatistic!: StatisticWordcloudComponent;
  @ViewChild(StatisticPrioritizationComponent)
  prioritizationStatistic!: StatisticPrioritizationComponent;
  @ViewChild(StatisticNumericComponent)
  numericStatistic!: StatisticNumericComponent;
  @ViewChild(StatisticShortAnswerComponent)
  shortAnswerStatistic!: StatisticShortAnswerComponent;

  destroyed$: Subject<void> = new Subject();

  @Input({ required: true }) content!: Content;
  @Input() directShow = false;
  @Input() active = false;
  @Input() index = 0;
  @Input() showCorrect = false;
  @Input() isPresentation = false;
  @Input() indexChanged?: EventEmitter<number>;
  @Input() isStandalone = true;
  @Output() updatedCounter: EventEmitter<AnswerResponseCounts> =
    new EventEmitter<AnswerResponseCounts>();
  @Input() settings = new UserSettings();
  @Input() isParticipant = false;
  @Input() language?: string;

  attachmentData: any;
  answersVisible = false;
  correctVisible = false;
  survey = false;
  responseCounts: AnswerResponseCounts = { answers: 0, abstentions: 0 };
  isLoading = true;
  format!: ContentType;
  ContentType: typeof ContentType = ContentType;
  flashcardMarkdownFeatures = MarkdownFeatureset.EXTENDED;
  HotkeyAction = HotkeyAction;
  multipleRounds = false;
  roundsToDisplay = 0;
  showWordcloudModeration = false;
  allowingUnitChange = false;

  visualizationUnitChanged = new EventEmitter<boolean>();

  // TODO: non-null assertion operator is used here temporaly. We need to make this component generic with a future refactoring.
  choiceContent!: ContentChoice;
  prioritizationContent!: ContentPrioritization;
  flashcardContent!: ContentFlashcard;
  numericContent!: ContentNumeric;

  constructor(
    private announceService: AnnounceService,
    private presentationService: PresentationService,
    private contentService: ContentService
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.attachmentData = {
      refType: 'content',
      refId: this.content.id,
      detailedView: false,
    };
    this.format = this.content.format;
    this.checkIfSurvey();
    if (this.directShow) {
      this.answersVisible = true;
    }
    this.roundsToDisplay = this.content.state.round - 1;
    this.multipleRounds = this.roundsToDisplay > 0;
    this.isLoading = false;
    if (this.indexChanged) {
      this.indexChanged.subscribe(() => {
        this.updateCounter(this.responseCounts);
        this.broadcastRoundState();
        if (this.directShow && this.active && !this.answersVisible) {
          this.toggleAnswers();
        }
      });
    }
    this.broadcastRoundState();
    if (this.contentService.hasFormatRounds(this.content.format)) {
      this.presentationService
        .getRoundStateChanges()
        .pipe(takeUntil(this.destroyed$))
        .subscribe((roundData) => {
          if (this.index === roundData.contentIndex) {
            this.changeRound(roundData.round);
          }
        });
    }
    this.allowingUnitChange = [
      ContentType.BINARY,
      ContentType.SCALE,
      ContentType.CHOICE,
      ContentType.PRIORITIZATION,
      ContentType.SORT,
      ContentType.NUMERIC,
    ].includes(this.content.format);
    this.initContentTypeObjects();
  }

  initContentTypeObjects() {
    if (
      [
        ContentType.CHOICE,
        ContentType.BINARY,
        ContentType.SORT,
        ContentType.SCALE,
      ].includes(this.content.format)
    ) {
      this.choiceContent = this.content as ContentChoice;
    } else if (this.content.format === ContentType.PRIORITIZATION) {
      this.prioritizationContent = this.content as ContentPrioritization;
    } else if (this.content.format === ContentType.FLASHCARD) {
      this.flashcardContent = this.content as ContentFlashcard;
    } else if (this.content.format === ContentType.NUMERIC) {
      this.numericContent = this.content as ContentNumeric;
    }
  }

  broadcastRoundState() {
    if (this.active) {
      this.presentationService.updateMultipleRoundState(this.multipleRounds);
    }
  }

  toggleAnswers() {
    if (this.format === ContentType.SLIDE) {
      return;
    }
    if (this.correctVisible) {
      this.toggleCorrect();
    }
    this.toggleAnswersInChildComponents();
    this.announceAnswers();
  }

  toggleAnswersInChildComponents() {
    switch (this.format) {
      case ContentType.SCALE:
        this.answersVisible = this.scaleStatistic.toggleAnswers();
        break;
      case ContentType.TEXT:
        this.answersVisible = this.textStatistic.toggleAnswers();
        break;
      case ContentType.SORT:
        this.answersVisible = this.sortStatistic.toggleAnswers();
        break;
      case ContentType.FLASHCARD:
        this.answersVisible = !this.answersVisible;
        break;
      case ContentType.WORDCLOUD:
        this.answersVisible = this.wordcloudStatistic.toggleAnswers();
        break;
      case ContentType.PRIORITIZATION:
        this.answersVisible = this.prioritizationStatistic.toggleAnswers();
        break;
      case ContentType.NUMERIC:
        this.answersVisible = this.numericStatistic.toggleAnswers();
        break;
      case ContentType.SHORT_ANSWER:
        this.answersVisible = this.shortAnswerStatistic.toggleAnswers();
        break;
      default:
        this.answersVisible = this.choiceStatistic.toggleAnswers();
    }
  }

  toggleCorrect() {
    if (this.answersVisible && !this.survey) {
      switch (this.format) {
        case ContentType.SORT:
          this.sortStatistic.toggleCorrect();
          break;
        case ContentType.NUMERIC:
          this.numericStatistic.toggleCorrect();
          break;
        case ContentType.CHOICE:
        case ContentType.BINARY:
          this.choiceStatistic.toggleCorrect();
          break;
        case ContentType.SHORT_ANSWER:
          this.shortAnswerStatistic.toggleCorrect();
          break;
      }
      this.correctVisible = !this.correctVisible;
    }
  }

  toggleVisualizationUnit() {
    this.settings.contentVisualizationUnitPercent =
      !this.settings.contentVisualizationUnitPercent;
    this.visualizationUnitChanged.emit(
      this.settings.contentVisualizationUnitPercent
    );
  }

  toggleWordcloudView() {
    this.showWordcloudModeration = !this.showWordcloudModeration;
  }

  checkIfSurvey() {
    let noCorrect = false;
    if (
      [
        ContentType.TEXT,
        ContentType.SCALE,
        ContentType.WORDCLOUD,
        ContentType.PRIORITIZATION,
      ].includes(this.format)
    ) {
      noCorrect = true;
    } else if ([ContentType.BINARY, ContentType.CHOICE].includes(this.format)) {
      const correctOptions = (this.content as ContentChoice)
        .correctOptionIndexes;
      noCorrect = !correctOptions || correctOptions.length === 0;
    } else if (this.format === ContentType.NUMERIC) {
      noCorrect = (this.content as ContentNumeric).correctNumber === undefined;
    }
    this.survey = noCorrect;
  }

  updateCounter(counts: AnswerResponseCounts) {
    this.responseCounts = counts;
    if (this.isPresentation) {
      this.updatedCounter.emit(this.responseCounts);
    }
  }

  private announceAnswers() {
    if (this.responseCounts.answers > 0) {
      const action = this.answersVisible ? 'expanded' : 'collapsed';
      const msg = 'creator.statistic.a11y-' + action + '-results';
      this.announceService.announce(msg);
    } else {
      this.announceService.announce('creator.statistic.a11y-no-answers-yet');
    }
  }

  changeRound(round: number) {
    let chartComponent:
      | StatisticChoiceComponent
      | StatisticScaleComponent
      | StatisticNumericComponent;
    switch (this.content.format) {
      case ContentType.SCALE:
        chartComponent = this.scaleStatistic;
        break;
      case ContentType.NUMERIC:
        chartComponent = this.numericStatistic;
        break;
      default:
        chartComponent = this.choiceStatistic;
    }
    this.roundsToDisplay = round;
    chartComponent.roundsToDisplay = round;
    chartComponent.rounds = round + 1;
    chartComponent.updateCounterForRound(round);
    if (this.answersVisible) {
      chartComponent.updateChart();
    }
  }
}
