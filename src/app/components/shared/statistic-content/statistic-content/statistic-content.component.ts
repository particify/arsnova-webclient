import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ContentText } from '@arsnova/app/models/content-text';
import { StatisticChoiceComponent } from '@arsnova/app/components/shared/statistic-content/statistic-choice/statistic-choice.component';
import { StatisticTextComponent } from '@arsnova/app/components/shared/statistic-content/statistic-text/statistic-text.component';
import { ContentType } from '@arsnova/app/models/content-type.enum';
import { ContentChoice } from '@arsnova/app/models/content-choice';
import { StatisticSortComponent } from '@arsnova/app/components/shared/statistic-content/statistic-sort/statistic-sort.component';
import { MarkdownFeatureset } from '@arsnova/app/services/http/formatting.service';
import { KeyboardKey } from '@arsnova/app/utils/keyboard/keys';
import { KeyboardUtils } from '@arsnova/app/utils/keyboard';
import { AnnounceService } from '@arsnova/app/services/util/announce.service';
import { StatisticWordcloudComponent } from '../statistic-wordcloud/statistic-wordcloud.component';
import { StatisticScaleComponent } from '../statistic-scale/statistic-scale.component';

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
  @Input() routeChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() updatedCounter: EventEmitter<number> = new EventEmitter<number>();

  attachmentData: any;
  answersVisible = false;
  survey = false;
  answerCount: number;
  isLoading = true;
  format: ContentType;
  ContentType: typeof ContentType = ContentType;
  flashcardMarkdownFeatures = MarkdownFeatureset.EXTENDED;

  constructor(private announceService: AnnounceService) { }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.active) {
      if (KeyboardUtils.isKeyEvent(event, KeyboardKey.SPACE) === true) {
        this.toggleAnswers();
        const isText = this.content.format === ContentType.TEXT;
        if (!isText || this.answerCount > 0) {
          const action = this.answersVisible ? 'expanded' : 'collapsed';
          const msg = 'statistic.a11y-' + action + '-answers' + (isText ? '-text' : '');
          this.announceService.announce(msg);
        } else {
          this.announceService.announce('statistic.a11y-no-answers-yet');
        }
      }
      if (KeyboardUtils.isKeyEvent(event, KeyboardKey.LetterC) === true) {
        this.toggleCorrect();
      }
    }
  }

  ngOnInit(): void {
    this.attachmentData = {
      roomId: this.content.roomId,
      refType: 'content',
      refId: this.content.id,
      detailedView: false
    };
    this.format = this.content.format;
    this.checkIfSurvey();
    if (this.directShow && this.format !== ContentType.FLASHCARD) {
      this.answersVisible = true;
    }
    this.isLoading = false;
    this.routeChanged.subscribe(() => {
      this.updateCounter(this.answerCount);
    })
  }

  toggleAnswers() {
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
  }

  toggleCorrect() {
    if (this.format === ContentType.SORT) {
      this.sortStatistic.toggleCorrect();
    } else {
      this.choiceStatistic.toggleCorrect();
    }
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
}
