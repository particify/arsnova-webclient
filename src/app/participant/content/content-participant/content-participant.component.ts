import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OutputRefSubscription,
  Signal,
  Type,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  viewChild,
} from '@angular/core';
import { HotkeyAction } from '@app/core/directives/hotkey.directive';
import { of, switchMap } from 'rxjs';
import { RoomUserAlias } from '@app/core/models/room-user-alias';
import { Router } from '@angular/router';
import { Location, NgClass, NgComponentOutlet } from '@angular/common';
import { LeaderboardPageComponent } from '@app/participant/leaderboard-page/leaderboard-page.component';
import { ContentResultsComponent } from '@app/standalone/content-results/content-results.component';
import { MatTooltip } from '@angular/material/tooltip';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CountdownTimerComponent } from '@app/standalone/countdown-timer/countdown-timer.component';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { MatIcon } from '@angular/material/icon';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { ContentWaitingComponent } from '@app/standalone/content-waiting/content-waiting.component';
import { FlexModule } from '@angular/flex-layout';
import { MatCard } from '@angular/material/card';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { CoreModule } from '@app/core/core.module';
import { LanguageContextDirective } from '@app/core/directives/language-context.directive';
import { LanguageDirectionPipe } from '@app/core/pipes/language-direction.pipe';
import {
  Answer,
  ContentAnswerResult,
  AnswerResultState,
  Content,
  ContentType,
  CreateQuestionnaireAbstentionGql,
  Questionnaire,
  QuestionnaireAnswerByRoundIdGql,
  QuestionnaireContentAnswerResultsByQuestionnaireIdDocument,
  QuestionnairePublishingMode,
  QuestionnaireType,
  UserUiSettings,
} from '@gql/generated/graphql';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { Apollo, onlyCompleteData } from 'apollo-angular';
import { ContentBinaryParticipantComponent } from '@app/participant/content/content-binary-participant/content-binary-participant.component';
import { ContentChoiceParticipantComponent } from '@app/participant/content/content-choice-participant/content-choice-participant.component';
import { ContentNumericParticipantComponent } from '@app/participant/content/content-numeric-participant/content-numeric-participant.component';
import { ContentPrioritizationParticipantComponent } from '@app/participant/content/content-prioritization-participant/content-prioritization-participant.component';
import { ContentScaleParticipantComponent } from '@app/participant/content/content-scale-participant/content-scale-participant.component';
import { ContentShortAnswerParticipantComponent } from '@app/participant/content/content-short-answer-participant/content-short-answer-participant.component';
import { ContentSortParticipantComponent } from '@app/participant/content/content-sort-participant/content-sort-participant.component';
import { ContentTextParticipantComponent } from '@app/participant/content/content-text-participant/content-text-participant.component';
import { ContentWordcloudParticipantComponent } from '@app/participant/content/content-wordcloud-participant/content-wordcloud-participant.component';
import { FORMAT_REGISTRY } from './format-registry';
import { evictRoundStats } from '@gql/helper/evict-round-stats';
import { AnswerForm } from '@app/participant/content/answer-form';
import {
  answeringEndDate,
  isRoundOver,
  roundKey,
} from '@app/standalone/countdown-timer/answering';
import { ServerTimeService } from '@app/core/services/util/server-time.service';
import { formatAnsweringDuration } from './answering-duration';
import { mutationHelper } from '@gql/helper/mutation-helper';

interface ContentActionTab {
  route: string;
  label: string;
  hotkey: string;
  icon: string;
}

const NON_ANSWERABLE_FORMATS = [ContentType.Flashcard, ContentType.Slide];

/** The answer forms that go inert once the round is over or has been answered. */
const LOCKABLE_ANSWER_FORMS: Type<unknown>[] = [
  ContentBinaryParticipantComponent,
  ContentChoiceParticipantComponent,
  ContentNumericParticipantComponent,
  ContentPrioritizationParticipantComponent,
  ContentScaleParticipantComponent,
  ContentShortAnswerParticipantComponent,
  ContentSortParticipantComponent,
  ContentTextParticipantComponent,
  ContentWordcloudParticipantComponent,
];

@Component({
  selector: 'app-content-participant',
  templateUrl: './content-participant.component.html',
  styleUrls: ['./content-participant.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CoreModule,
    LoadingIndicatorComponent,
    MatCard,
    FlexModule,
    ContentWaitingComponent,
    RenderedTextComponent,
    MatTabNav,
    MatTabLink,
    MatIcon,
    ExtensionPointModule,
    CountdownTimerComponent,
    MatTabNavPanel,
    FormsModule,
    NgClass,
    MatButton,
    LoadingButtonComponent,
    MatIconButton,
    MatTooltip,
    ContentResultsComponent,
    LeaderboardPageComponent,
    LanguageContextDirective,
    LanguageDirectionPipe,
  ],
})
export class ContentParticipantComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly focusModeService = inject(FocusModeService);
  private readonly answerByRoundId = inject(QuestionnaireAnswerByRoundIdGql);
  private readonly cache = inject(Apollo).client.cache;
  private readonly createAbstention = inject(CreateQuestionnaireAbstentionGql);
  private readonly mutations = mutationHelper();
  private readonly serverTimeService = inject(ServerTimeService);

  readonly formatComponent = computed(
    () => FORMAT_REGISTRY[this.content().formatData.format].component
  );

  readonly componentInputs = computed(() => {
    const base = {
      contentId: this.content()?.id,
      result: this.answer()?.result,
      answerFormatData: this.answer()?.formatData,
      roundId: this.content().activeRound?.id,
      contentFormatData: this.content().formatData,
      correctOptionsPublished: this.correctOptionsPublished(),
      ...(this.formatComponent() === ContentScaleParticipantComponent
        ? { language: this.language() }
        : {}),
    };
    const formatComponent = this.formatComponent();
    if (formatComponent && LOCKABLE_ANSWER_FORMS.includes(formatComponent)) {
      return {
        ...base,
        disabled: this.answeringLocked() || !!this.answer(),
      };
    }
    return base;
  });

  private readonly formComponentOutlet =
    viewChild<NgComponentOutlet>(NgComponentOutlet);
  private readonly answerForm: Signal<AnswerForm | undefined> = computed(
    () =>
      (this.formComponentOutlet()?.componentInstance as AnswerForm | null) ??
      undefined
  );
  shortId = input.required<string>();
  questionnaire = input.required<Questionnaire>();
  content = input.required<Content>();
  roomId = input.required<string>();
  showCard = input(true);
  correctOptionsPublished = input(false);
  userId = input.required<string>();
  settings = input.required<UserUiSettings>();
  lastContent = input(false);
  active = input(false);
  index = input.required<number>();
  statsPublished = input(false);
  attribution = input<string>();
  alias = input<RoomUserAlias>();
  answerResult = input<AnswerResultState>();
  activeTab = input<string>();
  finished = input(false);
  next = output<void>();

  private readonly answerRef = toSignal(
    toObservable(this.content).pipe(
      switchMap((content) => {
        if (content.activeRound) {
          return this.answerByRoundId
            .watch({
              variables: { roundId: content.activeRound?.id },
              fetchPolicy: 'no-cache',
            })
            .valueChanges.pipe(onlyCompleteData());
        }
        return of(undefined);
      })
    )
  );

  readonly answer = linkedSignal(
    () =>
      this.answerRef()?.data.questionnaireAnswerByRoundId as Answer | undefined
  );
  readonly loadingAnswer = computed(
    () => !!this.content().activeRound && (this.answerRef()?.loading ?? true)
  );

  /** Whether the content takes answers but no round has been started for it yet. */
  readonly answeringNotStarted = computed(
    () =>
      !this.content().activeRound &&
      !NON_ANSWERABLE_FORMATS.includes(this.content().formatData.format)
  );

  abstained = computed(
    () => this.answer()?.result === AnswerResultState.Abstained
  );

  readonly waitingForStart = computed(
    () =>
      this.questionnaire().publishingMode ===
        QuestionnairePublishingMode.Live &&
      !this.answer() &&
      !this.content().activeRound?.started
  );

  readonly isLive = computed(
    () =>
      this.questionnaire().publishingMode === QuestionnairePublishingMode.Live
  );

  readonly endDate = computed(() =>
    answeringEndDate(this.content().activeRound)
  );

  answeringLocked = linkedSignal({
    source: () => roundKey(this.content().activeRound),
    computation: () =>
      isRoundOver(
        this.content().activeRound,
        this.serverTimeService.determineServerTime().getTime(),
        this.isLive()
      ),
  });

  readonly answeringDuration = computed(() =>
    formatAnsweringDuration(this.answer()?.durationMs)
  );

  language = input.required<string>();

  ContentType = ContentType;
  HotkeyAction = HotkeyAction;

  selectedRoute = '';
  QuestionnaireType = QuestionnaireType;
  QuestionnairePublishingMode = QuestionnairePublishingMode;

  readonly focusModeEnabled = toSignal(
    this.focusModeService.getFocusModeEnabled()
  );

  tabs: ContentActionTab[] = [
    {
      route: '',
      label: 'participant.answer.my-answer',
      hotkey: '1',
      icon: 'person_edit',
    },
    {
      route: 'results',
      label: 'participant.answer.results',
      hotkey: '2',
      icon: 'insert_chart',
    },
    {
      route: 'leaderboard',
      label: 'content.leaderboard',
      hotkey: '3',
      icon: 'emoji_events',
    },
  ];

  constructor() {
    let answerCreatedSubscription: OutputRefSubscription | undefined;
    effect(() => {
      const form = this.answerForm();
      answerCreatedSubscription?.unsubscribe();
      answerCreatedSubscription = form?.answerCreated.subscribe((answer) =>
        this.setAnswer(answer)
      );
    });
    inject(DestroyRef).onDestroy(() => {
      answerCreatedSubscription?.unsubscribe();
    });
  }

  submitAnswer() {
    this.answerForm()?.submitAnswer();
  }

  submitAbstention() {
    const roundId = this.content().activeRound?.id;
    if (roundId) {
      this.createAbstention
        .mutate({ variables: { roundId } })
        .pipe(this.mutations.handleErrors())
        .subscribe({
          next: (r) => {
            const answer = r.data?.createQuestionnaireAbstention;
            if (answer) {
              this.setAnswer(answer as Answer);
            }
          },
        });
    }
  }

  setAnswer(answer: Answer) {
    this.answer.set(answer);
    const roundId = this.content().activeRound?.id;
    if (roundId) {
      evictRoundStats(this.cache, roundId);
    }
    this.cache.updateQuery<{
      questionnaireContentAnswerResultsByQuestionnaireId: ContentAnswerResult[];
    }>(
      {
        query: QuestionnaireContentAnswerResultsByQuestionnaireIdDocument,
        variables: { questionnaireId: this.questionnaire().id },
      },
      (data) => {
        if (!data) {
          return data;
        }
        return {
          questionnaireContentAnswerResultsByQuestionnaireId:
            data.questionnaireContentAnswerResultsByQuestionnaireId.map((r) =>
              r.contentId === this.content().id
                ? { ...r, result: answer.result }
                : r
            ),
        };
      }
    );
  }

  showTab(route: string): boolean {
    switch (route) {
      case '':
        return (
          this.statsPublished() || !!this.questionnaire().leaderboardEnabled
        );
      case 'results':
        return this.statsPublished();
      case 'leaderboard':
        return !!this.questionnaire().leaderboardEnabled;
      default:
        return false;
    }
  }

  updateTab(route: string): void {
    this.selectedRoute = route;
    const urlList = [
      'p',
      this.shortId(),
      'questionnaire',
      this.questionnaire().id,
      this.content().id,
    ];
    if (this.selectedRoute) {
      urlList.push(this.selectedRoute);
    }
    const urlTree = this.router.createUrlTree(urlList);
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }
}
