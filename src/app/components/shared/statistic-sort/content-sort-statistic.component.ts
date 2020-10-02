import { Component, OnInit, Type, Input } from '@angular/core';
import { ContentChoice } from '@arsnova/app/models/content-choice';
import { ContentService } from '@arsnova/app/services/http/content.service';
import { AnswerStatistics } from '@arsnova/app/models/answer-statistics';
import { BarController, CategoryScale, Chart, LinearScale, Rectangle, Tooltip } from 'chart.js';

@Component({
  selector: 'app-content-sort-statistic',
  templateUrl: './content-sort-statistic.component.html',
  styleUrls: ['./content-sort-statistic.component.scss']
})
export class ContentSortStatisticComponent implements OnInit {

  @Input() content: ContentChoice;
  @Input() directShow: boolean;

  chart: Chart;
  chartId: string;
  isLoading = true;
  chartVisible = false;
  isSurvey = false;
  data: number[] = [];
  labels: string[] = ['1', '2', '3', '4'];
  noAnswers = (currentValue) => currentValue === 0;

  constructor(private contentService: ContentService) {
  }

  ngOnInit(): void {
    this.chartId = 'chart-' + this.content.id;
    this.isSurvey = Math.max.apply(null, this.content.options.map(option => option.points)) > 0;
    this.loadData().subscribe(answer => {
      this.updateData(answer);
      setTimeout(() => {
        this.createChart();
      }, 300);
      this.isLoading = false;
    })
  }

  getId(): string {
    return 'content-sort-statistic';
  }

  getType(): Type<ContentSortStatisticComponent> {
    return ContentSortStatisticComponent;
  }

  toggleChart() {
    this.chartVisible = !this.chartVisible;
  }

  toggleCorrect() {
    // TODO
  }

  loadData() {
    return this.contentService.getAnswer(this.content.roomId, this.content.id);
  }

  updateData(stats: AnswerStatistics) {
    this.data = stats.roundStatistics[0].combinatedCounts.map(c => c.count);
    this.labels = stats.roundStatistics[0].combinatedCounts.map(c => c.selectedChoiceIndexes.toString().replace(/,/g, '-'));
    if (this.content.abstentionsAllowed) {
      this.data.push(stats.roundStatistics[0].abstentionCount);
    }
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
}
