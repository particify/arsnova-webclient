import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { TextRoundStatistics } from '@app/core/models/round-statistics';
import { ContentService } from '@app/core/services/http/content.service';
import { StatisticContentBaseComponent } from '@app/shared/statistic-content/statistic-content-base';
import { EventService } from '@app/core/services/util/event.service';
import { TextStatistic } from '@app/core/models/text-statistic';
import { WordCloudItem } from '@app/shared/wordcloud/wordcloud.component';

@Component({
  selector: 'app-statistic-wordcloud',
  templateUrl: './statistic-wordcloud.component.html',
  styleUrls: ['../text-statistic-content.scss'],
})
export class StatisticWordcloudComponent
  extends StatisticContentBaseComponent
  implements OnInit, OnDestroy
{
  @Input() showModeration = false;

  wordWeights: WordCloudItem[] = [];

  answerList: TextStatistic[] = [];

  constructor(
    protected contentService: ContentService,
    protected eventService: EventService
  ) {
    super(contentService, eventService);
  }

  afterInit() {
    this.contentService
      .getAnswersChangedStream(this.content.roomId, this.content.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((msg) => {
        const stats = JSON.parse(msg.body).payload.stats;
        this.updateData(stats);
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  init(stats: AnswerStatistics) {
    this.updateData(stats);
  }

  deleteAnswers() {
    this.wordWeights = [];
    this.updateCounter([]);
  }

  updateData(stats: AnswerStatistics) {
    if (stats) {
      const texts = (stats?.roundStatistics[0] as TextRoundStatistics)?.texts;
      this.updateCounter([stats.roundStatistics[0].answerCount]);
      if (!texts) {
        return;
      }
      this.wordWeights = stats.roundStatistics[0].independentCounts.map(
        (count, i) => new WordCloudItem(texts[i], count)
      );
      this.answerList = Array.from(
        this.wordWeights,
        (w) => new TextStatistic(w.text, w.size)
      );
    }
  }

  filterAnswers(keyword: string) {
    this.wordWeights = this.wordWeights.filter((w) => w.text !== keyword);
    this.answerList = this.answerList.filter((a) => a.answer !== keyword);
  }
}
