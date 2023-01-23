import { Component, Input, OnInit } from '@angular/core';
import { Content } from '../../../models/content';
import { ArcElement, Chart, DoughnutController, PieController } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { RoutingService } from '../../../services/util/routing.service';
import { ContentGroupService } from '../../../services/http/content-group.service';
import { ThemeService } from '../../../../theme/theme.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { ContentGroup } from '../../../models/content-group';
import {
  AnswerResultOverview,
  AnswerResultType,
} from '../../../models/answer-result';
import { UserRole } from '../../../models/user-roles.enum';
import { ClientAuthentication } from '../../../models/client-authentication';
import { Router } from '@angular/router';
import { Features } from '../../../models/features.enum';
import { ContentCarouselService } from '../../../services/util/content-carousel.service';

// Max time for updating db (5000) - navigation delay (500) / 2
const RELOAD_INTERVAL = 2250;
const RETRY_LIMIT = 4;

interface ContentResultView {
  body: string;
  state: AnswerResultType;
}

@Component({
  selector: 'app-series-overview',
  templateUrl: './series-overview.component.html',
  styleUrls: ['./series-overview.component.scss'],
})
export class SeriesOverviewComponent implements OnInit {
  @Input() group: ContentGroup;
  @Input() contents: Content[];
  @Input() finished: boolean;
  @Input() isPureInfoSeries: boolean;

  hasAnsweredLastContent: boolean;
  private chart: Chart;
  private colors = {
    chart: '',
    background: '',
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
    private routingService: RoutingService,
    private authService: AuthenticationService,
    private contentGroupService: ContentGroupService,
    private themeService: ThemeService,
    private router: Router,
    private contentCarouselService: ContentCarouselService
  ) {}

  ngOnInit(): void {
    this.hasAnsweredLastContent =
      this.contentCarouselService.isLastContentAnswered();
    this.getColors();
    this.authService.getCurrentAuthentication().subscribe((auth) => {
      this.auth = auth;
      this.init();
    });
  }

  private init() {
    this.contentGroupService
      .getAnswerStats(this.group.roomId, this.group.id, this.auth.userId)
      .subscribe(
        (resultOverview) => {
          this.setResultOverview(resultOverview);
          this.setViewData();
          this.checkIfLastContentIsLoaded();
          this.isLoading = false;
          if (this.hasScore) {
            this.updateChart();
          }
        },
        () => {
          this.getContentResultView();
          this.isLoading = false;
          this.isLoadingLastContent = false;
        }
      );
  }

  private setResultOverview(resultOverview: AnswerResultOverview) {
    this.resultOverview = resultOverview;
    this.setAnswerResultsForPublishedContents();
  }

  private setAnswerResultsForPublishedContents() {
    this.resultOverview.answerResults =
      this.resultOverview.answerResults.filter((a) =>
        this.checkIfContentIsPublished(a.contentId)
      );
  }

  private checkIfContentIsPublished(contentId: string) {
    return this.contents.map((c) => c.id).includes(contentId);
  }

  private setViewData() {
    this.hasScore = this.checkIfHasScore();
    this.score = this.getScore();
    this.getContentResultView();
  }

  private getScore(): number {
    return Math.round(
      (this.resultOverview.achievedScore / this.resultOverview.maxScore) * 100
    );
  }

  private checkIfHasScore(): boolean {
    return (
      this.resultOverview.maxScore > 0 && this.group.correctOptionsPublished
    );
  }

  private getContentResultView() {
    this.contentsWithResults = [];
    this.contents.forEach((val, i) => {
      this.contentsWithResults.push({
        body: val.renderedBody,
        state: this.resultOverview?.answerResults[i].state,
      });
    });
  }

  private getColors() {
    const theme = this.themeService.getThemeByKey(
      this.themeService.getCurrentThemeName()
    );
    this.colors.background = theme.get('background').color;
    this.colors.chart = theme.get('green').color;
  }

  private checkIfLastContentIsLoaded() {
    this.checkIfLastAnswerHasAnswered();
    if (this.isLoadingLastContent && this.retryCount < RETRY_LIMIT) {
      setTimeout(() => {
        this.contentGroupService
          .getAnswerStats(this.group.roomId, this.group.id, this.auth.userId)
          .subscribe((resultOverview) => {
            this.setResultOverview(resultOverview);
            this.checkIfLastContentIsLoaded();
            this.retryCount++;
          });
      }, RELOAD_INTERVAL);
    } else if (!this.isLoading) {
      this.setViewData();
      if (this.hasScore) {
        this.updateChart();
      }
    }
  }

  private checkIfLastAnswerHasAnswered() {
    const lastResultState =
      this.resultOverview.answerResults[
        this.resultOverview.answerResults.length - 1
      ].state;
    this.isLoadingLastContent =
      lastResultState === AnswerResultType.UNANSWERED &&
      this.hasAnsweredLastContent;
  }
  private getScoreData(): number[] {
    return [this.score, 100 - this.score];
  }

  private updateChart() {
    if (this.chart) {
      (this.chart.data.datasets[0].data = this.getScoreData()),
        this.chart.update();
    } else {
      setTimeout(() => {
        this.createChart();
      }, 300);
    }
  }

  private createChart() {
    const dataSets = [
      {
        data: this.getScoreData(),
        borderWidth: 0,
        backgroundColor: [this.colors.chart, this.colors.background],
        cutout: '90%',
      },
    ];

    Chart.register(
      PieController,
      DoughnutController,
      ArcElement,
      ChartDataLabels
    );
    this.chart = new Chart('chart', {
      type: 'doughnut',
      data: {
        datasets: dataSets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          datalabels: {
            display: false,
          },
        },
      },
    });
  }

  getIcon(state: AnswerResultType) {
    if (!this.group.correctOptionsPublished) {
      state = AnswerResultType.NEUTRAL;
    }
    switch (state) {
      case AnswerResultType.CORRECT:
        return 'check';
      case AnswerResultType.WRONG:
        return 'close';
      default:
        return 'fiber_manual_record';
    }
  }

  hasAnsweredState(state: AnswerResultType): boolean {
    return (
      state === AnswerResultType.NEUTRAL ||
      (!this.group.correctOptionsPublished &&
        this.quizAnswerTypes.includes(state))
    );
  }

  goToContent(index: number) {
    this.router.navigate([
      this.routingService.getRoleRoute(UserRole.PARTICIPANT),
      this.routingService.getShortId(),
      Features.CONTENTS,
      this.group.name,
      index + 1,
    ]);
  }

  getHeaderText(): string {
    if (this.isPureInfoSeries) {
      return this.group.name;
    } else {
      return this.finished
        ? 'content.thanks-for-participation'
        : 'content.continue-where-you-stopped';
    }
  }

  getSubHeaderText(): string {
    if (this.isPureInfoSeries) {
      return 'content.pure-info-contents';
    } else {
      return this.finished
        ? 'content.all-contents-answered'
        : 'content.some-contents-answered';
    }
  }
}
