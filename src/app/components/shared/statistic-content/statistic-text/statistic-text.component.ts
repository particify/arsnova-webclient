import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../../../services/http/content.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../services/util/language.service';
import { ContentText } from '../../../../models/content-text';
import { ContentAnswerService } from '../../../../services/http/content-answer.service';
import { TextAnswer } from '../../../../models/text-answer';
import { StatisticContentBaseComponent } from '../statistic-content-base';
import { Observable } from 'rxjs';

export class TextStatistic {
  answer: string;
  count: number;

  constructor(answer: string, count: number) {
    this.answer = answer;
    this.count = count;
  }
}

@Component({
  selector: 'app-statistic-text',
  templateUrl: './statistic-text.component.html',
  styleUrls: ['./statistic-text.component.scss']
})
export class StatisticTextComponent extends StatisticContentBaseComponent implements OnInit {

  @Input() content: ContentText;
  @Input() directShow: boolean;

  answers: TextStatistic[] = [];
  abstentionCount = 0;

  constructor(
    protected route: ActivatedRoute,
    protected contentService: ContentService,
    private contentAnswerService: ContentAnswerService,
    private translateService: TranslateService,
    protected langService: LanguageService
  ) {
    super(route, contentService);
  }

  loadData(): Observable<TextAnswer[]> {
    return this.contentAnswerService.getAnswers(this.content.roomId, this.content.id);
  }

  initData(answers: TextAnswer[]) {
    this.getData(answers);
  }

  getData(answers: TextAnswer[]) {
    const answersMap = new Map<string, TextStatistic>();
    for (const answer of answers) {
      if (answer.body) {
        if (answersMap.has(answer.body.toLowerCase())) {
          const count = answersMap.get(answer.body.toLowerCase()).count + 1;
          answersMap.set(answer.body.toLowerCase(), new TextStatistic(answersMap.get(answer.body.toLowerCase()).answer, count));
        } else {
          answersMap.set(answer.body.toLowerCase(), new TextStatistic(answer.body, 1));
        }
      } else {
        this.abstentionCount++;
      }
    }
    answersMap.forEach((value: TextStatistic) => {
      this.answers.push(new TextStatistic(value.answer, value.count));
    });
    this.answers.sort((a, b) => {
      return a.count > b.count ? -1 : 1;
    });
    if (this.abstentionCount > 0) {
      const abstentionString = this.translateService.instant(this.abstentionCount === 1 ? 'statistic.abstention' : 'statistic.abstentions');
      this.answers.push(new TextStatistic(abstentionString, this.abstentionCount));
    }
    this.updateCounter(this.answers.map(a => a.count));
  }
}
