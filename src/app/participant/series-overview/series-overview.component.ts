import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import {
  ArcElement,
  Chart,
  ChartType,
  DoughnutController,
  PieController,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { Router } from '@angular/router';
import { RoutingFeature } from '@app/core/models/routing-feature.enum';
import { ContentCarouselService } from '@app/core/services/util/content-carousel.service';
import { HintType } from '@app/core/models/hint-type.enum';
import { LeaderboardItem } from '@app/core/models/leaderboard-item';
import { RoomUserAlias } from '@app/core/models/room-user-alias';
import { provideTranslocoScope, TranslocoPipe } from '@jsverse/transloco';
import { CoreModule } from '@app/core/core.module';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatActionList, MatListItem } from '@angular/material/list';
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
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { ContentWaitingComponent } from '@app/standalone/content-waiting/content-waiting.component';
import {
  ContentAnswerResult,
  AnswerResultState,
  Content,
  Questionnaire,
  QuestionnaireType,
  ContentType,
  QuestionnaireAnswerResultsByQuestionnaireIdGql,
} from '@gql/generated/graphql';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, EMPTY, switchMap } from 'rxjs';

// Max time for updating db (5000) - navigation delay (500) / 2
// const RELOAD_INTERVAL = 2250;
// const RETRY_LIMIT = 4;

@Component({
  selector: 'app-series-overview',
  templateUrl: './series-overview.component.html',
  styleUrls: ['./series-overview.component.scss'],
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
    MatActionList,
    MatListItem,
    NgClass,
    MatTooltip,
    RenderedTextComponent,
    CoreModule,
    TranslocoPipe,
    OrdinalPipe,
    ContentWaitingComponent,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [provideTranslocoScope('participant')],
})
export class SeriesOverviewComponent implements OnInit, OnDestroy {
  private routingService = inject(RoutingService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private contentCarouselService = inject(ContentCarouselService);
  private contentPublishService = inject(ContentPublishService);
  private answerService = inject(ContentAnswerService);
  private readonly questionnaireAnswerResults = inject(
    QuestionnaireAnswerResultsByQuestionnaireIdGql
  );

  questionnaire = input.required<Questionnaire>();
  contents = input.required<Content[]>();
  answerResults = input.required<ContentAnswerResult[]>();
  roomId = input.required<string>();
  finished = input(false);
  isPureInfoSeries = input(false);
  alias = input<RoomUserAlias>();

  readonly contentsWithResults = computed(() => {
    return this.contents().map((c) => {
      const r = this.answerResults().find((r) => r.contentId === c.id);
      return {
        id: c.id,
        body: c.bodyRendered,
        state: r?.result,
        duration: r?.durationMs,
      };
    });
  });

  readonly isLoadingLastContent = computed(
    () =>
      this.answerResults().at(-1)?.result === AnswerResultState.Unanswered &&
      this.hasAnsweredLastContent
  );

  // The score stays neutral for participants until the correct answers are
  // published, so publishing them has to fetch it anew.
  private readonly answerResultsResult = toSignal(
    toObservable(this.questionnaire).pipe(
      distinctUntilChanged(
        (a, b) =>
          a.id === b.id &&
          a.correctOptionsPublished === b.correctOptionsPublished
      ),
      switchMap((questionnaire) => {
        return this.questionnaireAnswerResults
          .watch({
            variables: { questionnaireId: questionnaire.id },
            fetchPolicy: 'network-only',
          })
          .valueChanges.pipe(
            catchError((error) => {
              console.error('Questionnaire results query failed', error);
              return EMPTY;
            })
          );
      })
    )
  );

  readonly questionnaireResult = computed(
    () =>
      this.answerResultsResult()?.data
        ?.questionnaireAnswerResultsByQuestionnaireId
  );

  readonly loadingAnswerResults = computed(
    () => this.answerResultsResult()?.loading
  );

  readonly score = computed(() => {
    const achievedScore = this.questionnaireResult()?.achievedScore;
    const maxScore = this.questionnaireResult()?.maxScore;
    return achievedScore && maxScore
      ? Math.round((achievedScore / maxScore) * 100)
      : 0;
  });

  currentAnswerCount = computed(
    () =>
      this.answerResults().filter(
        (a) => a.result !== AnswerResultState.Unanswered
      )?.length ?? 0
  );

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
  private quizAnswerTypes = [
    AnswerResultState.Correct,
    AnswerResultState.Wrong,
  ];

  resultTypes: typeof AnswerResultState = AnswerResultState;
  ContentType = ContentType;
  totalContentCount = 0;

  retryCount = 0;
  hasScore = computed(
    () =>
      !!this.questionnaireResult()?.maxScore &&
      !!this.questionnaire().correctOptionsPublished
  );
  leaderboardPosition?: number;
  HintType = HintType;
  leaderboard?: LeaderboardItem[];
  userLeaderboardItem?: LeaderboardItem;
  selectedTabIndex = 0;
  QuestionnaireType = QuestionnaireType;

  constructor() {
    effect(() => {
      if (this.questionnaireResult()) {
        this.updateCharts();
      }
    });
  }

  ngOnDestroy(): void {
    this.contentCarouselService.setLastContentAnswered(false);
  }

  ngOnInit(): void {
    this.hasAnsweredLastContent =
      this.contentCarouselService.isLastContentAnswered();
    this.updateColors();
  }

  private updateCharts() {
    if (!this.isPureInfoSeries()) {
      this.updateProgressChart();
    }
    if (this.hasScore()) {
      this.updateCorrectChart();
    }
  }

  private checkIfContentIsPublished(contentId: string) {
    return this.contents()
      .map((c) => c.id)
      .includes(contentId);
  }

  private updateColors() {
    this.colors.background = this.themeService.getColor('background');
    this.colors.chart = this.themeService.getColor('green');
    this.colors.primary = this.themeService.getPrimaryColor();
    this.colors.gold = this.themeService.getColor('gold');
  }

  private getScoreData(): number[] {
    return [this.score(), 100 - this.score()];
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
    const totalCount = this.contentsWithResults().length;
    return [this.currentAnswerCount(), totalCount - this.currentAnswerCount()];
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

  getIcon(state: AnswerResultState) {
    return this.answerService.getAnswerResultIcon(state);
  }

  hasAnsweredState(state: AnswerResultState): boolean {
    return (
      state === AnswerResultState.Neutral ||
      (!this.questionnaire().correctOptionsPublished &&
        this.quizAnswerTypes.includes(state))
    );
  }

  goToContent(id: string) {
    this.router.navigate([
      this.routingService.getRoleRoute(UserRole.PARTICIPANT),
      this.routingService.getShortId(),
      RoutingFeature.CONTENTS,
      this.questionnaire().id,
      id,
    ]);
  }

  goToFirstUnanswered() {
    const content = this.contentsWithResults().find(
      (c) => c.state === AnswerResultState.Unanswered
    );
    if (content) {
      this.goToContent(content.id);
    }
  }

  getHeaderText(): string {
    if (this.isPureInfoSeries()) {
      return this.questionnaire().name;
    } else {
      return this.finished()
        ? 'participant.content.thanks-for-participation'
        : 'participant.content.continue-where-you-stopped';
    }
  }

  getSubHeaderText(): string {
    if (this.isPureInfoSeries()) {
      return 'participant.content.pure-info-contents';
    } else {
      return this.finished()
        ? 'participant.content.all-contents-answered'
        : 'participant.content.some-contents-answered';
    }
  }

  getProgressDataText(): string {
    return (
      this.currentAnswerCount() + ' / ' + this.contentsWithResults().length
    );
  }

  getLockedContentCount() {
    return this.totalContentCount - this.contents().length;
  }

  private getPosition(): number {
    if (this.userLeaderboardItem && this.leaderboard) {
      let score = 1;
      let position = score;
      this.leaderboard.forEach((value, index) => {
        if (index > 0 && value.score !== this.leaderboard![index - 1].score) {
          score = index + 1;
        }
        if (this.userLeaderboardItem?.userAlias?.id === value.userAlias?.id) {
          position = score;
          return;
        }
      });
      return position;
    }
    return -1;
  }

  isLiveMode(): boolean {
    return this.contentPublishService.isLive(this.questionnaire());
  }

  getTrophyIconColor(): string {
    switch (this.leaderboardPosition) {
      case 1:
        return 'gold';
      case 2:
        return 'silver';
      default:
        return 'bronze';
    }
  }
}
