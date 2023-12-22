import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Content } from '@app/core/models/content';
import {
  ArcElement,
  Chart,
  ChartType,
  DoughnutController,
  PieController,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ContentGroup } from '@app/core/models/content-group';
import {
  AnswerResultOverview,
  AnswerResultType,
} from '@app/core/models/answer-result';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { Router } from '@angular/router';
import { RoutingFeature } from '@app/core/models/routing-feature.enum';
import { ContentCarouselService } from '@app/core/services/util/content-carousel.service';
import { ContentType } from '@app/core/models/content-type.enum';
import { HintType } from '@app/core/models/hint-type.enum';

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
export class SeriesOverviewComponent implements OnInit, OnDestroy {
  @Input({ required: true }) group!: ContentGroup;
  @Input({ required: true }) contents!: Content[];
  @Input() finished = false;
  @Input() isPureInfoSeries = false;

  hasAnsweredLastContent = false;
  private correctChart?: Chart;
  private progressChart?: Chart;
  private colors = {
    chart: '',
    background: '',
    primary: '',
  };
  // TODO: non-null assertion operator is used here temporaly. We need to use a resolver here to move async logic out of component.
  private auth!: ClientAuthentication;
  private resultOverview!: AnswerResultOverview;
  private quizAnswerTypes = [AnswerResultType.CORRECT, AnswerResultType.WRONG];

  contentsWithResults: ContentResultView[] = [];
  resultTypes: typeof AnswerResultType = AnswerResultType;
  ContentType = ContentType;
  currentAnswerCount = 0;
  totalContentCount = 0;

  isLoading = true;
  isLoadingLastContent = true;
  retryCount = 0;
  hasScore = false;
  score = 0;
  HintType = HintType;

  constructor(
    private routingService: RoutingService,
    private authService: AuthenticationService,
    private contentGroupService: ContentGroupService,
    private themeService: ThemeService,
    private router: Router,
    private contentCarouselService: ContentCarouselService
  ) {}

  ngOnDestroy(): void {
    this.contentCarouselService.setLastContentAnswered(false);
  }

  ngOnInit(): void {
    this.hasAnsweredLastContent =
      this.contentCarouselService.isLastContentAnswered();
    this.updateColors();
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
          this.totalContentCount = resultOverview.answerResults.length;
          this.setResultOverview(resultOverview);
          this.setViewData();
          this.checkIfLastContentIsLoaded();
          this.isLoading = false;
          this.updateCharts();
        },
        () => {
          this.getContentResultView();
          this.isLoading = false;
          this.isLoadingLastContent = false;
        }
      );
  }

  private updateCharts() {
    if (!this.isPureInfoSeries) {
      this.updateProgressChart();
    }
    if (this.hasScore) {
      this.updateCorrectChart();
    }
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
    this.currentAnswerCount = this.getCurrentAnswerCount();
    this.getContentResultView();
  }

  private getCurrentAnswerCount() {
    return this.resultOverview.answerResults.filter(
      (a) => a.state !== AnswerResultType.UNANSWERED
    ).length;
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

  private updateColors() {
    this.colors.background = this.themeService.getColor('background');
    this.colors.chart = this.themeService.getColor('green');
    this.colors.primary = this.themeService.getPrimaryColor();
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
      this.updateCharts();
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

  private updateCorrectChart() {
    if (this.correctChart) {
      (this.correctChart.data.datasets[0].data = this.getScoreData()),
        this.correctChart.update();
    } else {
      setTimeout(() => {
        this.correctChart = this.createChart(
          'correct-chart',
          this.colors.chart,
          this.getScoreData()
        );
      }, 300);
    }
  }

  private getProgressData() {
    const totalCount = this.contentsWithResults.length;
    return [this.currentAnswerCount, totalCount - this.currentAnswerCount];
  }

  private updateProgressChart() {
    if (this.progressChart) {
      (this.progressChart.data.datasets[0].data = this.getProgressData()),
        this.progressChart.update();
    } else {
      setTimeout(() => {
        this.progressChart = this.createChart(
          'progress-chart',
          this.colors.primary,
          this.getProgressData()
        );
      }, 300);
    }
  }

  private createChart(
    id: string,
    color: string,
    data: number[]
  ): Chart | undefined {
    if (!document.getElementById(id)) {
      return;
    }
    const dataSets = [
      {
        data: data,
        borderWidth: 0,
        backgroundColor: [color, this.colors.background],
        cutout: '90%',
        rotation: -90,
        circumference: 180,
      },
    ];
    Chart.register(
      PieController,
      DoughnutController,
      ArcElement,
      ChartDataLabels
    );
    return new Chart(id, {
      type: 'doughnut' as ChartType,
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
      case AnswerResultType.UNANSWERED:
        return 'horizontal_rule';
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
      RoutingFeature.CONTENTS,
      this.group.name,
      index + 1,
    ]);
  }

  goToFirstUnanswered() {
    const index = this.contentsWithResults.findIndex(
      (c) => c.state === AnswerResultType.UNANSWERED
    );
    if (index) {
      this.goToContent(index);
    }
  }

  getHeaderText(): string {
    if (this.isPureInfoSeries) {
      return this.group.name;
    } else {
      return this.finished
        ? 'participant.content.thanks-for-participation'
        : 'participant.content.continue-where-you-stopped';
    }
  }

  getSubHeaderText(): string {
    if (this.isPureInfoSeries) {
      return 'participant.content.pure-info-contents';
    } else {
      return this.finished
        ? 'participant.content.all-contents-answered'
        : 'participant.content.some-contents-answered';
    }
  }

  getProgressDataText(): string {
    return this.currentAnswerCount + ' / ' + this.contentsWithResults.length;
  }

  getLockedContentCount() {
    return this.totalContentCount - this.contents.length;
  }
}
