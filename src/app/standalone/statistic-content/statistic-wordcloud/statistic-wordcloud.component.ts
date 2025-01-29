import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { TextRoundStatistics } from '@app/core/models/round-statistics';
import { ContentService } from '@app/core/services/http/content.service';
import { StatisticContentBaseComponent } from '@app/standalone/statistic-content/statistic-content-base';
import { TextStatistic } from '@app/core/models/text-statistic';
import {
  WordCloudItem,
  WordcloudComponent,
} from '@app/standalone/wordcloud/wordcloud.component';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { FlexModule } from '@angular/flex-layout';
import { NgClass } from '@angular/common';
import { AnswerListComponent } from '@app/standalone/answer-list/answer-list.component';
import { PresentationService } from '@app/core/services/util/presentation.service';

@Component({
  selector: 'app-statistic-wordcloud',
  templateUrl: './statistic-wordcloud.component.html',
  styleUrls: ['../text-statistic-content.scss'],
  imports: [
    NgClass,
    FlexModule,
    WordcloudComponent,
    AnswerListComponent,
    TranslocoPipe,
  ],
})
export class StatisticWordcloudComponent
  extends StatisticContentBaseComponent
  implements OnInit, OnDestroy
{
  @Input() showModeration = false;

  wordWeights: WordCloudItem[] = [];

  answerList: TextStatistic[] = [];

  rotateWords?: boolean;

  constructor(
    protected contentService: ContentService,
    protected translateService: TranslocoService,
    private presentationService: PresentationService
  ) {
    super(contentService, translateService);
  }

  afterInit() {
    this.contentService
      .getAnswersChangedStream(this.content.roomId, this.content.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((msg) => {
        const stats = JSON.parse(msg.body).payload.stats;
        this.updateData(stats);
      });
    this.contentService.getAnswerBanned().subscribe((answer) => {
      if (answer) {
        this.filterAnswers(answer);
      }
    });
    this.rotateWords = this.settings.rotateWordcloudItems;
    this.presentationService.updateWordcloudVisualization(this.rotateWords);
    this.presentationService
      .getWordcloudVisualizationChanged()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((rotateWords) => {
        this.rotateWords = rotateWords;
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
    this.updateCounter({ answers: 0, abstentions: 0 });
  }

  updateData(stats: AnswerStatistics) {
    if (stats) {
      const texts = (stats?.roundStatistics[0] as TextRoundStatistics)?.texts;
      this.updateCounter({
        answers: stats.roundStatistics[0].answerCount,
        abstentions: stats.roundStatistics[0].abstentionCount,
      });
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

  banAnswer(answer: TextStatistic) {
    this.contentService.banAnswer(
      this.content.roomId,
      this.content.id,
      answer.answer
    );
  }

  filterAnswers(keyword: string) {
    this.wordWeights = this.wordWeights.filter((w) => w.text !== keyword);
    this.answerList = this.answerList.filter((a) => a.answer !== keyword);
  }
}
