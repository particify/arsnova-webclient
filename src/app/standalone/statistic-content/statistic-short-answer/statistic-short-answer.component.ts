import { NgClass } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { ContentShortAnswer } from '@app/core/models/content-short-answer';
import { TextRoundStatistics } from '@app/core/models/round-statistics';
import { TextStatistic } from '@app/core/models/text-statistic';
import { ContentService } from '@app/core/services/http/content.service';
import { AnswerGridListComponent } from '@app/standalone/answer-grid-list/answer-grid-list.component';
import { AnswerListComponent } from '@app/standalone/answer-list/answer-list.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { StatisticContentBaseComponent } from '@app/standalone/statistic-content/statistic-content-base';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-statistic-short-answer',
  standalone: true,
  imports: [
    AnswerListComponent,
    AnswerGridListComponent,
    LoadingIndicatorComponent,
    NgClass,
    FlexModule,
    TranslocoPipe,
  ],
  templateUrl: './statistic-short-answer.component.html',
})
export class StatisticShortAnswerComponent
  extends StatisticContentBaseComponent
  implements OnDestroy
{
  @Input() showModeration = false;

  answerList: TextStatistic[] = [];

  showCorrect = false;

  constructor(
    protected contentService: ContentService,
    protected translateService: TranslocoService
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
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  init(stats: AnswerStatistics) {
    this.updateData(stats);
  }

  deleteAnswers() {
    this.answerList = [];
    this.updateCounter([]);
  }

  updateData(stats: AnswerStatistics) {
    if (stats) {
      const texts = (stats?.roundStatistics[0] as TextRoundStatistics)?.texts;
      this.updateCounter([stats.roundStatistics[0].answerCount]);
      if (!texts) {
        return;
      }
      this.answerList = stats.roundStatistics[0].independentCounts
        .map((count, i) => new TextStatistic(texts[i], count))
        .sort((a, b) => b.count - a.count);
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
    this.answerList = this.answerList.filter((a) => a.answer !== keyword);
  }

  toggleCorrect(): void {
    this.showCorrect = !this.showCorrect;
  }

  getCorrectAnswers(): string[] {
    return (this.content as ContentShortAnswer).correctTerms;
  }
}
