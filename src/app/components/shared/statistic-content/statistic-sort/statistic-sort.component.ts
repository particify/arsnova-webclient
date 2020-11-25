import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ContentChoice } from '../../../../models/content-choice';
import { ContentService } from '../../../../services/http/content.service';
import { AnswerStatistics } from '../../../../models/answer-statistics';
import {
  BarController,
  CategoryScale,
  Chart,
  LinearScale,
  Rectangle,
  Tooltip
} from 'chart.js';
import { StatisticContentBaseComponent } from '../statistic-content-base';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-statistic-sort',
  templateUrl: './statistic-sort.component.html',
  styleUrls: ['./statistic-sort.component.scss']
})
export class StatisticSortComponent extends StatisticContentBaseComponent implements OnInit, OnDestroy {

  @Input() content: ContentChoice;
  @Input() directShow: boolean;

  destroyed$ = new Subject();
  chart: Chart;
  chartId: string;
  isLoading = true;
  isSurvey = false;
  data: number[] = [];
  labels: string[] = ['1', '2', '3', '4'];

  constructor(protected contentService: ContentService,
              protected route: ActivatedRoute) {
    super(route, contentService);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  init(): void {
    this.chartId = 'chart-' + this.content.id;
    this.isSurvey = Math.max.apply(null, this.content.options.map(option => option.points)) > 0;
  }

  initData(stats: AnswerStatistics) {
    this.updateData(stats);
  }

  afterInit() {
    this.contentService.getAnswersChangedStream(this.content.roomId, this.content.id).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(msg => {
      const stats = JSON.parse(msg.body).payload.stats;
      this.updateData(stats);
      this.updateChart();
    });
  }

  updateData(stats: AnswerStatistics) {
    this.data = stats.roundStatistics[0].combinatedCounts.map(c => c.count);
    this.labels = stats.roundStatistics[0].combinatedCounts.map(c => c.selectedChoiceIndexes.toString().replace(/,/g, '-'));
    if (this.content.abstentionsAllowed) {
      this.data.push(stats.roundStatistics[0].abstentionCount);
    }
  }

  toggleAnswers(visible?: boolean): boolean {
    this.answersVisible = visible ?? !this.answersVisible;
    if (this.answersVisible) {
      this.updateChart();
    }
    return this.answersVisible;
  }

  toggleCorrect() {
    // TODO
  }

  createChart(colors?: string[]) {
    Chart.register(BarController, CategoryScale, LinearScale, Rectangle, Tooltip);
    this.chart = new Chart(this.chartId, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [
          {
          data: this.data,
          backgroundColor: ['#aa2222', '#22aa22', '#2222aa', '#aaaa22']
          },
        ]
      },
      options: {
        font: {
          color: '#000000',
          size: 16
        },
        legend: {
          display: false
        },
        tooltips: {
          mode: 'index'
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            ticks: {
              precision: 0
            },
            gridLines: {
              borderColor: '#000000'
            },
          },
          x: {
            type: 'category',
            gridLines: {
              borderColor: '#000000'
            }
          }
        }
      }
    });
  }

  updateChart() {
    if (this.chart) {
      this.chart.data.datasets[0].data = this.data;
      this.chart.update();
    } else {
      /* Wait for flip animation */
      setTimeout(() => {
        this.createChart();
      }, 300);
    }
  }
}
