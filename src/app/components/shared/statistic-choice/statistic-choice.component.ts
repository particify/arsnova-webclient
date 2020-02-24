import { Component, Input, OnInit } from '@angular/core';
import { Chart, LinearTickOptions } from 'chart.js';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../../services/http/content.service';
import { ContentChoice } from '../../../models/content-choice';
import { TranslateService } from '@ngx-translate/core';

export class AnswerList {
  label: string;
  answer: string;

  constructor(label: string, answer: string) {
    this.label = label;
    this.answer = answer;
  }
}

@Component({
  selector: 'app-statistic-choice',
  templateUrl: './statistic-choice.component.html',
  styleUrls: ['./statistic-choice.component.scss']
})
export class StatisticChoiceComponent implements OnInit {

  @Input() content: ContentChoice;
  @Input() survey: boolean;

  chart: Chart;
  colors: string[] = [];
  ccolors: string[] = [];
  label = 'ABCDEFGH';
  labels: string[] = [];
  answers: string[] = [];
  answerList: AnswerList[] = [];
  data: number[] = [];
  contentId: string;
  isLoading = true;

  constructor(protected route: ActivatedRoute,
              private contentService: ContentService,
              private translateService: TranslateService) {
  }

  ngOnInit() {
    this.getData(this.content);
    this.isLoading = false;
  }

  createChart(colors: string[]) {
    const tickOptions: LinearTickOptions = {
      beginAtZero: true,
      precision: 0
    };
    this.chart = new Chart('chart', {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [{
          data: this.data,
          backgroundColor: colors
        }]
      },
      options: {
        legend: {
          display: false
        },
        tooltips: {
          mode: 'index'
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            ticks: tickOptions
          }]
        }
      }
    });
  }

  showCorrect() {
    this.createChart(this.ccolors);
  }

  showNormal() {
    this.createChart(this.colors);
  }

  getData(content: ContentChoice) {
    const length = content.options.length;
    for (let i = 0; i < length; i++) {
      this.answerList[i] = new AnswerList(null, null);
      this.labels[i] = this.label.charAt(i);
      this.answerList[i].label = this.labels[i];
      this.answerList[i].answer = content.options[i].label;
      if (i % 2 === 0) {
        this.colors[i] = '#7986cb';
      } else {
        this.colors[i] = '#9575cd';
      }
      if (!this.survey) {
        if (content.options[i].points <= 0) {
          this.ccolors[i] = '#ff7043';
        } else {
          this.ccolors[i] = '#66bb6a';
        }
      }
    }
    this.contentService.getAnswer(content.id).subscribe(answer => {
      this.data = answer.roundStatistics[0].independentCounts;
      this.data.push(answer.roundStatistics[0].abstentionCount);
      if (this.data[this.data.length - 1] > 0) {
        this.ccolors.push('rgba(189,189,189, 0.8)');
        this.colors.push('rgba(189,189,189, 0.8)');
        this.translateService.get('statistic.abstentions').subscribe(label => {
          this.labels.push(label);
        });
      }
      this.createChart(this.colors);
    });
  }
}
