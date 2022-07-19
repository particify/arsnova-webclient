import { Component, Input, OnInit } from '@angular/core';
import { ContentService } from '../../../../services/http/content.service';
import { TranslateService } from '@ngx-translate/core';
import { ContentText } from '../../../../models/content-text';
import { ContentAnswerService } from '../../../../services/http/content-answer.service';
import { TextAnswer } from '../../../../models/text-answer';
import { StatisticContentBaseComponent } from '../statistic-content-base';
import { Observable } from 'rxjs';
import { EventService } from '../../../../services/util/event.service';
import { TextStatistic } from '../../../../models/text-statistic';

@Component({
  selector: 'app-statistic-text',
  templateUrl: './statistic-text.component.html',
  styleUrls: ['./statistic-text.component.scss']
})
export class StatisticTextComponent extends StatisticContentBaseComponent implements OnInit {

  @Input() content: ContentText;
  @Input() directShow: boolean;

  answerStats: TextStatistic[] = [];
  answers: TextAnswer[] = [];
  abstentionCount = 0;

  constructor(
    protected contentService: ContentService,
    private contentAnswerService: ContentAnswerService,
    private translateService: TranslateService,
    protected eventService: EventService) {
    super(contentService, eventService);
  }

  loadData(): Observable<TextAnswer[]> {
    return this.contentAnswerService.getAnswers(this.content.roomId, this.content.id);
  }

  initData(answers: TextAnswer[]) {
    this.getData(answers);
  }

  deleteAnswers() {
    this.answers = [];
    this.getData([]);
  }

  getData(answers: TextAnswer[]) {
    const answersMap = new Map<string, TextStatistic>();
    for (const answer of answers) {
      this.answers.push(answer);
      if (answer.body) {
        const answerBody = answer.body.toLowerCase();
        const count = answersMap.has(answerBody) ? answersMap.get(answerBody).count + 1 : 1;
        answersMap.set(answerBody, new TextStatistic(answer.body, count, answer.id));
      } else {
        this.abstentionCount++;
      }
    }
    answersMap.forEach((value: TextStatistic) => {
      this.answerStats.push(new TextStatistic(value.answer, value.count, value.id));
    });
    this.answerStats.sort((a, b) => {
      return a.count > b.count ? -1 : 1;
    });
    if (this.abstentionCount > 0) {
      const abstentionString = this.translateService.instant(this.abstentionCount === 1 ? 'statistic.abstention' : 'statistic.abstentions');
      this.answerStats.push(new TextStatistic(abstentionString, this.abstentionCount));
    }
    this.updateCounter(this.answerStats.map(a => a.count));
  }

  filterAnswers(answerId: string) {
    this.answerStats = this.answerStats.filter(a => a.id !== answerId);
  }
}
