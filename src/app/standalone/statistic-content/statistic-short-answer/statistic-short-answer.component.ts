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
import { CorrectAnswerResultsComponent } from '@app/standalone/correct-answer-results/correct-answer-results.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { StatisticContentBaseComponent } from '@app/standalone/statistic-content/statistic-content-base';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
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
    CorrectAnswerResultsComponent,
  ],
  templateUrl: './statistic-short-answer.component.html',
})
export class StatisticShortAnswerComponent
  extends StatisticContentBaseComponent
  implements OnDestroy
{
  @Input() showModeration = false;
  @Input() showCorrect = false;

  answerList: TextStatistic[] = [];
  abstentionCount = 0;

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
    if (this.showCorrect && !this.getCorrectAnswers()) {
      this.contentService
        .getCorrectTerms(this.content.roomId, this.content.id)
        .subscribe((correctTerms) => {
          (this.content as ContentShortAnswer).correctTerms = correctTerms;
          this.updateData(stats);
        });
    } else {
      this.updateData(stats);
    }
  }

  deleteAnswers() {
    this.answerList = [];
    this.updateCounter({ answers: 0, abstentions: 0 });
  }

  updateData(stats: AnswerStatistics) {
    if (stats) {
      const texts = (stats?.roundStatistics[0] as TextRoundStatistics)?.texts;
      this.abstentionCount = stats.roundStatistics[0].abstentionCount;
      this.updateCounter({
        answers: stats.roundStatistics[0].answerCount,
        abstentions: this.abstentionCount,
      });
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
    return (this.content as ContentShortAnswer).correctTerms ?? [];
  }

  getCorrectAnswerCount(): number {
    const correctTerms = this.answerList.filter((a) =>
      this.getCorrectAnswers().includes(a.answer)
    );
    if (correctTerms.length > 0) {
      return this.getAnswerCount(correctTerms);
    }
    return 0;
  }

  getAnswerCount(answers: TextStatistic[] = this.answerList): number {
    return answers.map((a) => a.count).reduce((a, b) => a + b, 0);
  }
}
