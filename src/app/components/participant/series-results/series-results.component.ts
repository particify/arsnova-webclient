import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Content } from '../../../models/content';
import { ArcElement, Chart, DoughnutController, PieController } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { TranslateService } from '@ngx-translate/core';
import { RoutingService } from '../../../services/util/routing.service';
import { ContentGroupService } from '../../../services/http/content-group.service';
import { ThemeService } from '../../../../theme/theme.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { ContentGroup } from '../../../models/content-group';
import { AnswerResultOverview, AnswerResultType } from '../../../models/answer-result';
import { UserRole } from '../../../models/user-roles.enum';
import { ClientAuthentication } from '../../../models/client-authentication';

// Max time for updating db (5000) - navigation delay (500) / 2
const RELOAD_INTERVAL = 2250;
const RETRY_LIMIT = 4;

interface ContentResultView {
  body: string;
  state: AnswerResultType;
}

@Component({
  selector: 'app-series-results',
  templateUrl: './series-results.component.html',
  styleUrls: ['./series-results.component.scss']
})
export class SeriesResultsComponent implements OnInit {

  @Input() group: ContentGroup;
  @Input() contents: Content[];
  @Input() hasAnsweredLastContent: boolean;
  @Output() newContentIndex = new EventEmitter<number>();

  private chart: Chart;
  private colors = {
    chart: '',
    background: ''
  };
  private auth: ClientAuthentication;
  private resultOverview: AnswerResultOverview;
  private quizAnswerTypes = [AnswerResultType.CORRECT, AnswerResultType.WRONG];

  contentsWithResults: ContentResultView[];
  resultTypes: typeof AnswerResultType = AnswerResultType;

  isLoading = true;
  isLoadingLastContent = true;
  retryCount = 0;
  hasScore = false;
  score: number;

  constructor(
    private translateService: TranslateService,
    private routingService: RoutingService,
    private authService: AuthenticationService,
    private contentGroupService: ContentGroupService,
    private themeService: ThemeService) { }

  ngOnInit(): void {
    this.getColors();
    this.authService.getCurrentAuthentication().subscribe(auth => {
      this.auth = auth;
      this.init();
    });
  }

  private init() {
    this.contentGroupService.getAnswerStats(this.group.roomId, this.group.id, this.auth.userId).subscribe(resultOverview => {
      this.resultOverview = resultOverview;
      this.setData();
      this.checkIfLastContentIsLoaded();
      this.isLoading = false;
      if (this.hasScore) {
        this.updateChart();
      }
    });
  }

  private setData() {
    this.hasScore = this.checkIfHasScore();
    this.score = this.getScore();
    this.getContentResultView();
  }

  private getScore(): number {
    return Math.round(this.resultOverview.achievedScore / this.resultOverview.maxScore * 100);
  }

  private checkIfHasScore(): boolean {
    return this.resultOverview.maxScore > 0 && this.group.correctOptionsPublished;
  }

  private getContentResultView() {
    this.contentsWithResults = [];
    this.contents.forEach((val, i) => {
      const body = this.getContentLabel(this.contents[i], i);
      this.contentsWithResults.push({
        body: body,
        state: this.resultOverview.answerResults[i].state
      });
    });
  }

  private getContentLabel(content: Content, index: number) {
    const text = document.createElement('span');
    text.innerHTML = content.renderedBody;
    if (content.body.trim() === text.textContent.trim()) {
      return content.body;
    } else {
      return this.translateService.instant('content.body-label', {index: index + 1});; 
    }
  }

  private getColors() {
    const theme = this.themeService.getThemeByKey(this.themeService.getCurrentThemeName());
    this.colors.background = theme.get('background').color;
    this.colors.chart = theme.get('green').color;
  }

  private checkIfLastContentIsLoaded() {
    this.checkIfLastAnswerHasAnswered();
    if (this.isLoadingLastContent && this.retryCount < RETRY_LIMIT) {
      setTimeout(() => {
        this.contentGroupService.getAnswerStats(this.group.roomId, this.group.id, this.auth.userId).subscribe(results => {
          this.resultOverview = results;
          this.checkIfLastContentIsLoaded();
          this.retryCount++;
        });
      }, RELOAD_INTERVAL);
    } else if (!this.isLoading) {
      this.setData();
      if (this.hasScore) {
        this.updateChart();
      }
    }
  }

  private checkIfLastAnswerHasAnswered() {
    const lastResultState = this.resultOverview.answerResults[this.resultOverview.answerResults.length - 1].state;
    this.isLoadingLastContent = lastResultState === AnswerResultType.UNANSWERED && this.hasAnsweredLastContent;
  }
  private getScoreData(): number[] {
    return [this.score, (100 - this.score)]
  }

  private updateChart() {
    if (this.chart) {
      this.chart.data.datasets[0].data = this.getScoreData(),
      this.chart.update();
    } else {
      setTimeout(() => {
        this.createChart();
      }, 300)
    }
  }
    
  private createChart() {
    const dataSets = [
      {
        data: this.getScoreData(),
        borderWidth: 0,
        backgroundColor: [this.colors.chart, this.colors.background],
        cutout: '90%'
      }
    ];

    Chart.register(PieController, DoughnutController, ArcElement, ChartDataLabels);
    this.chart = new Chart('chart', {
      type: 'doughnut',
      data: {
        datasets: dataSets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          datalabels: {
            display: false
          }
        }
      }
    });
  }

  getIcon(state: AnswerResultType) {
    if (!this.group.correctOptionsPublished) {
      state = AnswerResultType.NEUTRAL;
    }
    switch(state) {
      case AnswerResultType.CORRECT:
        return 'check';
      case AnswerResultType.WRONG:
        return 'close';
      default:
        return 'fiber_manual_record';
    }
  }

  hasAnsweredState(state: AnswerResultType): boolean {
    return state === AnswerResultType.NEUTRAL || (!this.group.correctOptionsPublished && this.quizAnswerTypes.includes(state));
  }

  goToContent(index: number) {
    this.newContentIndex.emit(index);
  }

  goToRoomOverview() {
    this.routingService.navigate(`${this.routingService.getRoleString(UserRole.PARTICIPANT)}/${this.routingService.getShortId()}`);
  }
}