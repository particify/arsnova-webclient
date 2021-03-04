import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-statistic-content',
  templateUrl: './statistic-content.component.html',
  styleUrls: ['./statistic-content.component.scss']
})
export class StatisticContentComponent implements OnInit {

  @ViewChild(StatisticChoiceComponent) choiceStatistic: StatisticChoiceComponent;
  @ViewChild(StatisticTextComponent) textStatistic: StatisticTextComponent;
  @ViewChild(StatisticSortComponent) sortStatistic: StatisticSortComponent;

  @Input() content: ContentText;
  @Input() directShow: boolean;
  @Input() active: boolean;
  @Input() index: number;

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
  }

  toggleAnswers() {
    switch (this.format) {
      case ContentType.TEXT:
        this.answersVisible = this.textStatistic.toggleAnswers();
        break;
      case ContentType.SORT:
        this.answersVisible = this.sortStatistic.toggleAnswers();
        break;
      case ContentType.FLASHCARD:
        this.answersVisible = !this.answersVisible;
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
    let maxPoints;
    if (this.format === ContentType.BINARY || this.format === ContentType.CHOICE) {
      maxPoints = Math.max.apply(Math, (this.content as ContentChoice).options.map((option) => option.points));
    }
    if ((this.format === ContentType.TEXT || this.format === ContentType.SCALE || maxPoints <= 0) && this.format !== ContentType.SORT) {
      this.survey = true;
    }
  }

  updateCounter($event: number) {
    this.answerCount = $event;
  }
}
