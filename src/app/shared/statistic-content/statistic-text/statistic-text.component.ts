import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ContentService } from '@app/core/services/http/content.service';
import { TranslateService } from '@ngx-translate/core';
import { Content } from '@app/core/models/content';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { TextAnswer } from '@app/core/models/text-answer';
import { StatisticContentBaseComponent } from '@app/shared/statistic-content/statistic-content-base';
import { Observable, takeUntil } from 'rxjs';
import { EventService } from '@app/core/services/util/event.service';
import { TextStatistic } from '@app/core/models/text-statistic';

@Component({
  selector: 'app-statistic-text',
  templateUrl: './statistic-text.component.html',
  styleUrls: ['../text-statistic-content.scss'],
})
export class StatisticTextComponent
  extends StatisticContentBaseComponent
  implements OnInit, OnDestroy
{
  @Input() content: Content;
  @Input() directShow: boolean;

  answerStats: TextStatistic[] = [];
  answers: TextAnswer[] = [];
  abstentionCount = 0;

  constructor(
    protected contentService: ContentService,
    private contentAnswerService: ContentAnswerService,
    private translateService: TranslateService,
    protected eventService: EventService
  ) {
    super(contentService, eventService);
  }

  loadData(): Observable<TextAnswer[]> {
    return this.contentAnswerService.getAnswers(
      this.content.roomId,
      this.content.id
    );
  }

  init(answers: TextAnswer[]) {
    this.updateData(answers);
    this.getData();
  }

  afterInit() {
    this.contentService
      .getTextAnswerCreatedStream(this.content.roomId, this.content.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((msg) => {
        const answer = JSON.parse(msg.body).payload as TextAnswer;
        answer.contentId = this.content.id;
        this.addAnswerToList(answer);
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  deleteAnswers() {
    this.answers = [];
    this.getData();
  }

  updateData(answers: TextAnswer[]) {
    answers.forEach((answer) => {
      this.answers.push(answer);
    });
  }

  getData() {
    this.getAnswerStats();
    this.updateCounter(this.answerStats.map((a) => a.count));
  }

  getAnswerStats() {
    this.answerStats = [];
    const answersMap = new Map<string, TextStatistic>();
    for (const answer of this.answers) {
      if (answer.body) {
        const answerBody = answer.body.toLowerCase();
        const count = answersMap.has(answerBody)
          ? (answersMap.get(answerBody)?.count || 0) + 1
          : 1;
        answersMap.set(
          answerBody,
          new TextStatistic(answer.body, count, answer.id)
        );
      } else {
        this.abstentionCount++;
      }
    }
    answersMap.forEach((value: TextStatistic) => {
      this.answerStats.push(
        new TextStatistic(value.answer, value.count, value.id)
      );
    });
    this.answerStats.sort((a, b) => {
      return a.count > b.count ? -1 : 1;
    });
    if (this.abstentionCount > 0) {
      const abstentionString = this.translateService.instant(
        this.abstentionCount === 1
          ? 'statistic.abstention'
          : 'statistic.abstentions'
      );
      this.answerStats.push(
        new TextStatistic(abstentionString, this.abstentionCount)
      );
    }
  }

  filterAnswers(answerId: string) {
    this.answerStats = this.answerStats.filter((a) => a.id !== answerId);
  }

  addAnswerToList(answer: TextAnswer) {
    this.answers.push(answer);
    this.getData();
  }
}
