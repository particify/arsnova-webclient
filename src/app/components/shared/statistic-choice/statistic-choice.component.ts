import { Component, Input, OnInit } from '@angular/core';
import { Chart, LinearTickOptions } from 'chart.js';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../../services/http/content.service';
import { ContentChoice } from '../../../models/content-choice';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../../theme/theme.service';
import { Theme } from '../../../../theme/Theme';
import { Content } from '../../../models/content';
import { ContentType } from '../../../models/content-type.enum';

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
  @Input() directShow: boolean;

  chart: Chart;
  colors: string[] = [];
  indicationColors: string[] = [];
  label = 'ABCDEFGH';
  labels: string[] = [];
  answerList: AnswerList[] = [];
  data: number[] = [];
  contentId: string;
  isLoading = true;
  colorLabel = false;
  theme: Theme;
  survey = false;
  chartVisible = false;

  constructor(protected route: ActivatedRoute,
              private contentService: ContentService,
              private translateService: TranslateService,
              private themeService: ThemeService) {
  }

  ngOnInit(): void {
    this.checkIfSurvey(this.content);
    this.getData(this.content);
    this.isLoading = false;
    if (this.directShow) {
      this.toggleChart();
    }
  }

  createChart(colors: string[]) {
    const tickOptions: LinearTickOptions = {
      beginAtZero: true,
      precision: 0,
      fontColor: this.theme.colors[16].color,
      fontSize: 16
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
          }],
          xAxes: [{
            ticks: tickOptions
          }]
        }
      }
    });
  }

  toggleChart() {
    if (!this.chartVisible) {
      this.chartVisible = true;
      setTimeout(() => {
        this.createChart(this.colors);
      }, 300);
    } else {
      this.colorLabel = false;
      this.chartVisible = false;
    }
  }

  toggleCorrect() {
    this.colorLabel ? this.createChart(this.colors) : this.createChart(this.indicationColors);
    this.colorLabel = !this.colorLabel;
  }

  checkIfCorrect(index: number): boolean {
    return (this.content.options[index].points >= 0);
  }

  checkIfSurvey(content: Content) {
    let maxPoints;
    if (content.format === ContentType.BINARY) {
      maxPoints = Math.max.apply(Math, (content as ContentChoice).options.map(function(option) { return option.points; }));
    }
    if (content.format === ContentType.TEXT || content.format === ContentType.SCALE || maxPoints === 0) {
      this.survey = true;
    }
  }

  getData(content: ContentChoice) {
    const length = content.options.length;
    let green, grey, blue: string;
    this.themeService.getTheme().subscribe(theme => {
      this.theme = this.themeService.getThemeByKey(theme);
      green = this.theme.colors[19].color;
      grey = this.theme.colors[26].color;
      blue = this.theme.colors[25].color;
    });
    for (let i = 0; i < length; i++) {
      this.answerList[i] = new AnswerList(null, null);
      this.labels[i] = this.label.charAt(i);
      this.answerList[i].label = this.labels[i];
      this.answerList[i].answer = content.options[i].label;
      this.colors[i] = blue;
      if (!this.survey) {
        if (this.checkIfCorrect(i)) {
          this.indicationColors[i] = green;
        } else {
          this.indicationColors[i] = blue;
        }
      }
    }
    this.contentService.getAnswer(content.id).subscribe(answer => {
      this.data = answer.roundStatistics[0].independentCounts;
      this.data.push(answer.roundStatistics[0].abstentionCount);
      if (this.data[this.data.length - 1] > 0) {
        this.indicationColors.push(grey);
        this.colors.push(grey);
        this.translateService.get('statistic.abstentions').subscribe(label => {
          this.labels.push(label);
        });
      }
    });
  }
}
