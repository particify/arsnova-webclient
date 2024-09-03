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
import { ContentGroup, GroupType } from '@app/core/models/content-group';
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
import { LeaderboardItem } from '@app/core/models/leaderboard-item';
import { RoomUserAlias } from '@app/core/models/room-user-alias';
import { TranslocoPipe } from '@jsverse/transloco';
import { CoreModule } from '@app/core/core.module';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatList, MatListItem } from '@angular/material/list';
import { MatButton } from '@angular/material/button';
import { HintComponent } from '@app/standalone/hint/hint.component';
import { LeaderboardComponent } from '@app/standalone/leaderboard/leaderboard.component';
import { InfoChartComponent } from './info-chart/info-chart.component';
import { MatIcon } from '@angular/material/icon';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { NgStyle, NgClass } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { FlexModule } from '@angular/flex-layout';
import { OrdinalPipe } from '@app/core/pipes/ordinal.pipe';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { ContentWaitingComponent } from '@app/standalone/content-waiting/content-waiting.component';

// Max time for updating db (5000) - navigation delay (500) / 2
const RELOAD_INTERVAL = 2250;
const RETRY_LIMIT = 4;

interface ContentResultView {
  body: string;
  state: AnswerResultType;
  duration?: number;
}

@Component({
  selector: 'app-series-overview',
  templateUrl: './series-overview.component.html',
  styleUrls: ['./series-overview.component.scss'],
  standalone: true,
  imports: [
    FlexModule,
    MatCard,
    LoadingIndicatorComponent,
    MatIcon,
    InfoChartComponent,
    LeaderboardComponent,
    HintComponent,
    NgStyle,
    MatButton,
    MatList,
    MatListItem,
    NgClass,
    MatTooltip,
    RenderedTextComponent,
    CoreModule,
    TranslocoPipe,
    OrdinalPipe,
    ContentWaitingComponent,
  ],
})
export class SeriesOverviewComponent implements OnInit, OnDestroy {
  @Input({ required: true }) group!: ContentGroup;
  @Input({ required: true }) contents!: Content[];
  @Input() finished = false;
  @Input() isPureInfoSeries = false;
  @Input() alias?: RoomUserAlias;

  hasAnsweredLastContent = false;
  private correctChart?: Chart;
  private progressChart?: Chart;
  private pointsChart?: Chart;
  private colors = {
    chart: '',
    background: '',
    primary: '',
    gold: '',
  };
  // TODO: non-null assertion operator is used here temporaly. We need to use a resolver here to move async logic out of component.
  auth!: ClientAuthentication;
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
  leaderboard?: LeaderboardItem[];
  userLeaderboardItem?: LeaderboardItem;
  selectedTabIndex = 0;
  GroupType = GroupType;

  constructor(
    private routingService: RoutingService,
    private authService: AuthenticationService,
    private contentGroupService: ContentGroupService,
    private themeService: ThemeService,
    private router: Router,
    private contentCarouselService: ContentCarouselService,
    private contentPublishService: ContentPublishService,
    private answerService: ContentAnswerService
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

  loadLeaderboard(): void {
    this.contentGroupService
      .getLeaderboard(this.group.roomId, this.group.id)
      .subscribe((leaderboard) => {
        this.leaderboard = leaderboard;
        this.userLeaderboardItem = this.leaderboard.find(
          (l) => l.userAlias?.id === this.alias?.id
        );
        this.updatePointsChart();
        this.isLoading = false;
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
          if (this.group.leaderboardEnabled) {
            this.loadLeaderboard();
          } else {
            this.isLoading = false;
          }
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
        duration: this.resultOverview?.answerResults[i].duration,
      });
    });
  }

  private updateColors() {
    this.colors.background = this.themeService.getColor('background');
    this.colors.chart = this.themeService.getColor('green');
    this.colors.primary = this.themeService.getPrimaryColor();
    this.colors.gold = this.themeService.getColor('gold');
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
          });
        if (this.group.leaderboardEnabled) {
          this.contentGroupService
            .getLeaderboard(this.group.roomId, this.group.id)
            .subscribe((leaderboard) => {
              this.leaderboard = leaderboard;
              this.userLeaderboardItem = this.leaderboard.find(
                (l) => l.userAlias?.id === this.alias?.id
              );
              this.updatePointsChart();
            });
        }
        this.retryCount++;
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
      this.correctChart.data.datasets[0].data = this.getScoreData();
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
      this.progressChart.data.datasets[0].data = this.getProgressData();
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

  private updatePointsChart() {
    if (this.pointsChart) {
      this.pointsChart.data.datasets[0].data = this.getPointChartData();
      this.pointsChart.update();
    } else {
      setTimeout(() => {
        this.pointsChart = this.createChart(
          'points-chart',
          this.colors.gold,
          this.getPointChartData()
        );
      }, 300);
    }
  }

  private getPointChartData() {
    if (this.leaderboard && this.userLeaderboardItem) {
      return [
        this.userLeaderboardItem.score,
        this.leaderboard
          .map((l) => l.score)
          .reduce((a, b) => Math.max(a, b), 0) - this.userLeaderboardItem.score,
      ];
    }
    return [0, 0];
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
    return this.answerService.getAnswerResultIcon(state);
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

  getPosition(): number {
    if (this.userLeaderboardItem) {
      const position = this.leaderboard
        ?.map((l) => l.userAlias?.id)
        .indexOf(this.userLeaderboardItem.userAlias?.id);
      if (position !== undefined) {
        return position + 1;
      }
    }
    return -1;
  }

  isLiveMode(): boolean {
    return this.contentPublishService.isGroupLive(this.group);
  }

  getTrophyIconColor(): string {
    switch (this.getPosition()) {
      case 1:
        return 'gold';
      case 2:
        return 'silver';
      default:
        return 'bronze';
    }
  }
}
