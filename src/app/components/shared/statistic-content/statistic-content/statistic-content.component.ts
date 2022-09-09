import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ContentText } from '@arsnova/app/models/content-text';
import { StatisticChoiceComponent } from '@arsnova/app/components/shared/statistic-content/statistic-choice/statistic-choice.component';
import { StatisticTextComponent } from '@arsnova/app/components/shared/statistic-content/statistic-text/statistic-text.component';
import { ContentType } from '@arsnova/app/models/content-type.enum';
import { ContentChoice } from '@arsnova/app/models/content-choice';
import { StatisticSortComponent } from '@arsnova/app/components/shared/statistic-content/statistic-sort/statistic-sort.component';
import { MarkdownFeatureset } from '@arsnova/app/services/http/formatting.service';
import { AnnounceService } from '@arsnova/app/services/util/announce.service';
import { StatisticWordcloudComponent } from '../statistic-wordcloud/statistic-wordcloud.component';
import { StatisticScaleComponent } from '../statistic-scale/statistic-scale.component';
import { HotkeyAction } from '../../../../directives/hotkey.directive';
import { EventService } from '../../../../services/util/event.service';
import { RemoteMessage } from '../../../../models/events/remote/remote-message.enum';
import { UiState } from '../../../../models/events/remote/ui-state-changed-event';
import { ContentFocusState } from '../../../../models/events/remote/content-focus-state';
import { ContentMessages } from '../../../../models/events/content-messages.enum';
import { ContentService } from '../../../../services/http/content.service';
import { ActivatedRoute } from '@angular/router';
import { UserRole } from '../../../../models/user-roles.enum';
import { UserSettings } from '../../../../models/user-settings';

@Component({
  selector: 'app-statistic-content',
  templateUrl: './statistic-content.component.html',
  styleUrls: ['./statistic-content.component.scss']
})
export class StatisticContentComponent implements OnInit {

  @ViewChild(StatisticChoiceComponent) choiceStatistic: StatisticChoiceComponent;
  @ViewChild(StatisticScaleComponent) scaleStatistic: StatisticScaleComponent;
  @ViewChild(StatisticTextComponent) textStatistic: StatisticTextComponent;
  @ViewChild(StatisticSortComponent) sortStatistic: StatisticSortComponent;
  @ViewChild(StatisticWordcloudComponent) wordcloudStatistic: StatisticWordcloudComponent;

  @Input() content: ContentText;
  @Input() directShow: boolean;
  @Input() active: boolean;
  @Input() index: number;
  @Input() correctOptionsPublished: boolean;
  @Input() isPresentation = false;
  @Input() indexChanged: EventEmitter<number> = new EventEmitter<number>();
  @Input() contentGroupId: string;
  @Input() useCustomFlipAction = false;
  @Output() updatedCounter: EventEmitter<number> = new EventEmitter<number>();
  @Output() customFlipEvent = new EventEmitter();
  @Input() settings: UserSettings;

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

  constructor(private announceService: AnnounceService,
              private eventService: EventService,
              private contentService: ContentService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.attachmentData = {
      refType: 'content',
      refId: this.content.id,
      detailedView: false
    };
    this.format = this.content.format;
    this.checkIfSurvey();
    if (this.directShow && this.format !== ContentType.FLASHCARD) {
      this.answersVisible = true;
    }
    this.roundsToDisplay = this.content.state.round - 1;
    this.multipleRounds = this.roundsToDisplay > 0;
    this.isParticipant = this.route.snapshot.data.viewRole === UserRole.PARTICIPANT;
    this.isLoading = false;
    this.indexChanged.subscribe(index => {
      this.updateCounter(this.answerCount);
      this.broadcastRoundState();
      if (this.settings.showResultsDirectly && index === this.index && !this.answersVisible) {
        this.toggleAnswers();
      }
    });
    this.broadcastRoundState();
    this.eventService.on<any>(ContentMessages.ROUND_CHANGED).subscribe(roundData => {
      if (this.index === roundData.contentIndex) {
        this.changeRound(roundData.round);
      }
    });
    if (this.isPresentation) {
      this.eventService.on<UiState>(RemoteMessage.UI_STATE_CHANGED).subscribe(state => {
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
        const remoteState = new ContentFocusState(this.content.id, this.contentGroupId, false, false);
        this.eventService.broadcast(RemoteMessage.CHANGE_CONTENTS_STATE, remoteState);
      }
    }
  }

  broadcastRoundState() {
    if (this.active) {
      this.eventService.broadcast(ContentMessages.MULTIPLE_ROUNDS, this.multipleRounds);
    }
  }

  sendUiState() {
    const remoteState = new ContentFocusState(this.content.id, this.contentGroupId, this.answersVisible, this.correctVisible);
    this.eventService.broadcast(RemoteMessage.CHANGE_CONTENTS_STATE, remoteState);
  }

  toggleAnswers(sendState = true) {
    if (this.correctVisible) {
      this.toggleCorrect(false);
    }
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
      default:
        this.answersVisible = this.choiceStatistic.toggleAnswers();
    }
    this.announceAnswers();
    if (this.isPresentation && sendState) {
      this.sendUiState();
    }
  }

  toggleCorrect(sendState = true) {
    if (this.answersVisible && !this.survey) {
      if (this.format === ContentType.SORT) {
        this.sortStatistic.toggleCorrect();
      } else if ([ContentType.CHOICE, ContentType.BINARY].includes(this.format)) {
        this.choiceStatistic.toggleCorrect();
      }
      this.correctVisible = !this.correctVisible;
      if (this.isPresentation && sendState) {
        this.sendUiState();
      }
    }
  }

  toggleWordcloudView() {
    this.showWordcloudModeration = !this.showWordcloudModeration;
  }

  checkIfSurvey() {
    let noCorrect = false;
    if ([ContentType.TEXT, ContentType.SCALE, ContentType.WORDCLOUD].includes(this.format)) {
      noCorrect = true;
    } else if ([ContentType.BINARY, ContentType.CHOICE].includes(this.format)) {
      const correctOptions = (this.content as ContentChoice).correctOptionIndexes;
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
      const msg = 'statistic.a11y-' + action + '-answers' + (isText ? '-text' : '');
      this.announceService.announce(msg);
    } else {
      this.announceService.announce('statistic.a11y-no-answers-yet');
    }
  }

  changeRound(round: number) {
    const chartComponent: StatisticChoiceComponent | StatisticScaleComponent = this.content.format === ContentType.SCALE ? this.scaleStatistic : this.choiceStatistic;
    chartComponent.roundsToDisplay = round;
    chartComponent.rounds = round + 1;
    chartComponent.updateCounterForRound();
    if (this.answersVisible) {
      chartComponent.updateChart();
    }
  }
}
