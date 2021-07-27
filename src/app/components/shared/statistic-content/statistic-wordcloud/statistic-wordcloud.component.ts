import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AnswerStatistics } from "../../../../models/answer-statistics";
import { TextRoundStatistics } from "../../../../models/round-statistics";
import { ContentService } from "../../../../services/http/content.service";
import { StatisticContentBaseComponent } from "../statistic-content-base";

@Component({
  selector: 'app-statistic-wordcloud',
  templateUrl: './statistic-wordcloud.component.html',
  styleUrls: ['./statistic-wordcloud.component.scss']
})
export class StatisticWordcloudComponent extends StatisticContentBaseComponent implements OnInit, OnDestroy {
  wordWeights: [string, number][] = [];
  destroyed$ = new Subject();

  constructor(
      protected contentService: ContentService,
      protected route: ActivatedRoute) {
    super(route, contentService);
  }

  afterInit() {
    this.contentService.getAnswersChangedStream(this.content.roomId, this.content.id).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(msg => {
      const stats = JSON.parse(msg.body).payload.stats;
      this.updateData(stats);
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  initData(stats: AnswerStatistics) {
    this.updateData(stats);
  }

  updateData(stats: AnswerStatistics) {
    const texts = (stats.roundStatistics[0] as TextRoundStatistics).texts;
    this.updateCounter([stats.roundStatistics[0].answerCount]);
    if (!texts) {
      return;
    }
    this.wordWeights = stats.roundStatistics[0].independentCounts.map((count, i) => [texts[i], count]);
  }
}
