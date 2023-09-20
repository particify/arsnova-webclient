import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { StatisticChoiceComponent } from '@app/shared/statistic-content/statistic-choice/statistic-choice.component';
import { StatisticTextComponent } from '@app/shared/statistic-content/statistic-text/statistic-text.component';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentChoice } from '@app/core/models/content-choice';
import { StatisticSortComponent } from '@app/shared/statistic-content/statistic-sort/statistic-sort.component';
import { MarkdownFeatureset } from '@app/core/services/http/formatting.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { StatisticWordcloudComponent } from '@app/shared/statistic-content/statistic-wordcloud/statistic-wordcloud.component';
import { StatisticScaleComponent } from '@app/shared/statistic-content/statistic-scale/statistic-scale.component';
import { HotkeyAction } from '@app/core/directives/hotkey.directive';
import { ActivatedRoute } from '@angular/router';
import { UserRole } from '@app/core/models/user-roles.enum';
import { UserSettings } from '@app/core/models/user-settings';
import { StatisticPrioritizationComponent } from '@app/shared/statistic-content/statistic-prioritization/statistic-prioritization.component';
import { RemoteService } from '@app/core/services/util/remote.service';
import { Content } from '@app/core/models/content';
import { ContentFlashcard } from '@app/core/models/content-flashcard';
import { ContentPrioritization } from '@app/core/models/content-prioritization';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { Subject, takeUntil } from 'rxjs';
import { ContentService } from '@app/core/services/http/content.service';

@Component({
  selector: 'app-content-results',
  templateUrl: './content-results.component.html',
  styleUrls: ['./content-results.component.scss'],
})
export class ContentResultsComponent implements OnInit, OnDestroy {
  @ViewChild(StatisticChoiceComponent)
  choiceStatistic: StatisticChoiceComponent;
  @ViewChild(StatisticScaleComponent) scaleStatistic: StatisticScaleComponent;
  @ViewChild(StatisticTextComponent) textStatistic: StatisticTextComponent;
  @ViewChild(StatisticSortComponent) sortStatistic: StatisticSortComponent;
  @ViewChild(StatisticWordcloudComponent)
  wordcloudStatistic: StatisticWordcloudComponent;
  @ViewChild(StatisticPrioritizationComponent)
  prioritizationStatistic: StatisticPrioritizationComponent;

  destroyed$: Subject<void> = new Subject();

  @Input() content: Content;
  @Input() directShow: boolean;
  @Input() active: boolean;
  @Input() index: number;
  @Input() correctOptionsPublished: boolean;
  @Input() isPresentation = false;
  @Input() indexChanged: EventEmitter<void> = new EventEmitter<void>();
  @Input() useCustomFlipAction = false;
  @Output() updatedCounter: EventEmitter<number> = new EventEmitter<number>();
  @Output() customFlipEvent = new EventEmitter();
  @Input() settings = new UserSettings();

  attachmentData: any;
  answersVisible = false;
  correctVisible = false;
  survey = false;
  answerCount: number;
  isLoading = true;
  format: ContentType;
  ContentType: typeof ContentType = ContentType;
  flashcardMarkdownFeatures = MarkdownFeatureset.EXTENDED;
  HotkeyAction = HotkeyAction;
  multipleRounds: boolean;
  roundsToDisplay = 0;
  showWordcloudModeration = false;
  isParticipant = true;
  allowingUnitChange = false;

  visualizationUnitChanged = new EventEmitter<boolean>();

  choiceContent: ContentChoice;
  prioritizationContent: ContentPrioritization;
  flashcardContent: ContentFlashcard;

  constructor(
    private announceService: AnnounceService,
    private route: ActivatedRoute,
    private remoteService: RemoteService,
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
    this.isParticipant =
      this.route.snapshot.data.viewRole === UserRole.PARTICIPANT;
    this.isLoading = false;
    this.indexChanged.subscribe(() => {
      this.updateCounter(this.answerCount);
      this.broadcastRoundState();
      if (
        this.settings.showContentResultsDirectly &&
        this.active &&
        !this.answersVisible
      ) {
        this.toggleAnswers();
      }
    });
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
    if (this.isPresentation) {
      this.remoteService.getUiState().subscribe((state) => {
        if (this.content.id === state.contentId) {
          if (state.resultsVisible !== this.answersVisible) {
            this.toggleAnswers(false);
          }
          if (state.correctAnswersVisible !== this.correctVisible) {
            const timeout = state.timeout ? 500 : 0;
            setTimeout(() => {
              this.toggleCorrect(false);
            }, timeout);
          }
        }
      });
      if (this.active) {
        this.sendUiState(false, false);
      }
    }
    this.allowingUnitChange = [
      ContentType.BINARY,
      ContentType.SCALE,
      ContentType.CHOICE,
      ContentType.PRIORITIZATION,
      ContentType.SORT,
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
    }
  }

  broadcastRoundState() {
    if (this.active) {
      this.presentationService.updateMultipleRoundState(this.multipleRounds);
    }
  }

  sendUiState(
    answersVisible = this.answersVisible,
    correctVisible = this.correctVisible
  ) {
    // TODO: Send UI state for remote
  }

  toggleAnswers(sendState = true) {
    if (this.format === ContentType.SLIDE) {
      return;
    }
    if (this.correctVisible) {
      this.toggleCorrect(false);
    }
    this.toggleAnswersInChildComponents();
    this.announceAnswers();
    if (this.isPresentation && sendState) {
      this.sendUiState();
    }
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
      default:
        this.answersVisible = this.choiceStatistic.toggleAnswers();
    }
  }

  toggleCorrect(sendState = true) {
    if (this.answersVisible && !this.survey) {
      if (this.format === ContentType.SORT) {
        this.sortStatistic.toggleCorrect();
      } else if (
        [ContentType.CHOICE, ContentType.BINARY].includes(this.format)
      ) {
        this.choiceStatistic.toggleCorrect();
      }
      this.correctVisible = !this.correctVisible;
      if (this.isPresentation && sendState) {
        this.sendUiState();
      }
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
    }
    this.survey = noCorrect;
  }

  updateCounter($event: number) {
    this.answerCount = $event;
    if (this.isPresentation) {
      this.updatedCounter.emit(this.answerCount);
    }
  }

  private announceAnswers() {
    const isText = this.content.format === ContentType.TEXT;
    if (!isText || this.answerCount > 0) {
      const action = this.answersVisible ? 'expanded' : 'collapsed';
      const msg =
        'creator.statistic.a11y-' +
        action +
        '-answers' +
        (isText ? '-text' : '');
      this.announceService.announce(msg);
    } else {
      this.announceService.announce('creator.statistic.a11y-no-answers-yet');
    }
  }

  changeRound(round: number) {
    const chartComponent: StatisticChoiceComponent | StatisticScaleComponent =
      this.content.format === ContentType.SCALE
        ? this.scaleStatistic
        : this.choiceStatistic;
    this.roundsToDisplay = round;
    chartComponent.roundsToDisplay = round;
    chartComponent.rounds = round + 1;
    chartComponent.updateCounterForRound();
    if (this.answersVisible) {
      chartComponent.updateChart();
    }
  }
}
