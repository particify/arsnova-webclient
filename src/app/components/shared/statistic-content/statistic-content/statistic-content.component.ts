import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ContentText } from '@arsnova/app/models/content-text';
import { StatisticChoiceComponent } from '@arsnova/app/components/shared/statistic-content/statistic-choice/statistic-choice.component';
import { StatisticTextComponent } from '@arsnova/app/components/shared/statistic-content/statistic-text/statistic-text.component';
import { ContentType } from '@arsnova/app/models/content-type.enum';
import { ContentChoice } from '@arsnova/app/models/content-choice';

@Component({
  selector: 'app-statistic-content',
  templateUrl: './statistic-content.component.html',
  styleUrls: ['./statistic-content.component.scss']
})
export class StatisticContentComponent implements OnInit {

  @ViewChild(StatisticChoiceComponent) choiceStatistic: StatisticChoiceComponent;
  @ViewChild(StatisticTextComponent) textStatistic: StatisticTextComponent;

  @Input() content: ContentText;
  @Input() directShow: boolean;

  attachmentData: any;
  answersVisible = false;
  survey = false;
  answerCount: number;
  isLoading = true;
  format: ContentType;
  ContentType: typeof ContentType = ContentType;

  constructor() { }

  ngOnInit(): void {
    this.attachmentData = {
      'roomId': this.content.roomId,
      'refType': 'content',
      'refId': this.content.id,
      'detailedView': false
    };
    this.format = this.content.format;
    this.checkIfSurvey();
    this.isLoading = false;
  }

  toggleAnswers() {
    switch (this.format) {
      case ContentType.TEXT:
        this.answersVisible = this.textStatistic.toggleAnswers();
        break;
      default:
        this.answersVisible = this.choiceStatistic.toggleAnswers();
    }
  }

  toggleCorrect() {
    this.choiceStatistic.toggleCorrect();
  }

  checkIfSurvey() {
    let maxPoints;
    if (this.format === ContentType.BINARY || this.format === ContentType.CHOICE) {
      maxPoints = Math.max.apply(Math, (this.content as ContentChoice).options.map(function(option) { return option.points; }));
    }
    if (this.format === ContentType.TEXT || this.format === ContentType.SCALE || maxPoints <= 0) {
      this.survey = true;
    }
  }

  updateCounter($event: number) {
    this.answerCount = $event;
  }
}
