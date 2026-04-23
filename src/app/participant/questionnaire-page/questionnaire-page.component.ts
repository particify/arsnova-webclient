import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import {
  provideTranslocoScope,
  TranslocoService,
  TranslocoPipe,
} from '@jsverse/transloco';
import {
  STEPPER_ANIMATION_DURATION,
  StepperComponent,
} from '@app/standalone/stepper/stepper.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { Location } from '@angular/common';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { map, Subject, switchMap } from 'rxjs';
import { ContentCarouselService } from '@app/core/services/util/content-carousel.service';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { ContentLicenseAttribution } from '@app/core/models/content-license-attribution';
import { LICENSES } from '@app/core/models/licenses';
import { RoomUserAlias } from '@app/core/models/room-user-alias';
import { SeriesOverviewComponent } from '@app/participant/series-overview/series-overview.component';
import { ContentParticipantComponent } from '@app/participant/content/content-participant/content-participant.component';
import { CdkStep } from '@angular/cdk/stepper';
import { FlexModule } from '@angular/flex-layout';
import { CoreModule } from '@app/core/core.module';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { BaseCardComponent } from '@app/standalone/base-card/base-card.component';
import { ContentWaitingComponent } from '@app/standalone/content-waiting/content-waiting.component';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  ContentAnswerResult,
  AnswerResultState,
  Content,
  Questionnaire,
  QuestionnaireContentAnswerResultsByQuestionnaireIdGql,
  QuestionnaireContentsByQuestionnaireIdGql,
  QuestionnairePublishingMode,
  UserUiSettings,
  QuestionnaireType,
  ContentType,
} from '@gql/generated/graphql';

function setDefaultTrue(value: boolean | undefined): boolean {
  return value ?? true;
}

@Component({
  selector: 'app-questionnaire-page',
  templateUrl: './questionnaire-page.component.html',
  imports: [
    LoadingIndicatorComponent,
    CoreModule,
    FlexModule,
    StepperComponent,
    CdkStep,
    ContentParticipantComponent,
    SeriesOverviewComponent,
    TranslocoPipe,
    BaseCardComponent,
    ContentWaitingComponent,
  ],
  providers: [provideTranslocoScope('participant')],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class QuestionnairePageComponent {
  private readonly translateService = inject(TranslocoService);
  private readonly route = inject(ActivatedRoute);
  private readonly announceService = inject(AnnounceService);
  private readonly location = inject(Location);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);
  private readonly contentCarouselService = inject(ContentCarouselService);
  private readonly focusModeService = inject(FocusModeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly contentsByQuestionnareId = inject(
    QuestionnaireContentsByQuestionnaireIdGql
  );
  private readonly answerResultsByQuestionnaireId = inject(
    QuestionnaireContentAnswerResultsByQuestionnaireIdGql
  );

  stepper = viewChild(StepperComponent);

  // Route data input below
  questionnaire = input.required<Questionnaire>();
  shortId = input.required<string>();
  roomId = input.required<string>();
  settings = input.required<UserUiSettings>();
  activeTab = input<string>();
  showCard = input(true, { transform: setDefaultTrue });
  showStepper = input(true, { transform: setDefaultTrue });
  language = input.required<string>();

  private readonly contentsResult = toSignal(
    toObservable(this.questionnaire).pipe(
      switchMap((questionnaire) => {
        return this.contentsByQuestionnareId.watch({
          variables: { questionnaireId: questionnaire.id },
          fetchPolicy: 'network-only',
        }).valueChanges;
      })
    )
  );

  private readonly answerResultsResult = toSignal(
    toObservable(this.questionnaire).pipe(
      switchMap((questionnaire) => {
        return this.answerResultsByQuestionnaireId.watch({
          variables: { questionnaireId: questionnaire.id },
        }).valueChanges;
      })
    )
  );

  readonly answerResults = computed(() => {
    const results =
      this.answerResultsResult()?.data
        ?.questionnaireContentAnswerResultsByQuestionnaireId ?? [];
    return results.filter((r): r is ContentAnswerResult => !!r);
  });

  readonly loadingAnswerResults = computed(
    () => this.answerResultsResult()?.loading
  );

  readonly contents = computed(() => {
    const edges =
      this.contentsResult()?.data?.questionnaireContentsByQuestionnaireId
        ?.edges;
    return edges?.map((e) => e?.node).filter((n): n is Content => !!n) ?? [];
  });

  readonly loadingContents = computed(() => this.contentsResult()?.loading);

  readonly contentIndexes = computed(() =>
    Array.from(Array(this.questionnaire().contentCount).keys())
  );

  readonly userId = toSignal(
    this.authenticationService.getCurrentAuthentication().pipe(
      takeUntilDestroyed(this.destroyRef),
      map((a) => a.userId)
    )
  );

  private destroyed$ = new Subject<void>();

  ContentType: typeof ContentType = ContentType;
  QuestionnairePublishingMode = QuestionnairePublishingMode;

  isLoading = false;
  started = false;
  AnsweResultState = AnswerResultState;
  currentStep?: number;
  isReloading = false;
  isReloadingCurrentContent = false;
  displaySnackBar = false;
  focusModeEnabled = toSignal(this.focusModeService.getFocusModeEnabled());
  lockedContentId?: string;

  isFinished = computed(
    () =>
      !!this.answerResults() &&
      !this.answerResults()
        .map((r) => r.result)
        .includes(AnswerResultState.Unanswered)
  );
  isPureInfoSeries = computed(() =>
    this.contents().every((c) => this.isInfoContent(c))
  );
  hasAnsweredLastContent = false;
  showOverview = false;

  attributions: ContentLicenseAttribution[] = [];
  alias?: RoomUserAlias;
  prevAnswerResults: ContentAnswerResult[] = [];

  constructor() {
    let prevAnswerResults: ContentAnswerResult[] = [];
    effect(() => {
      if (
        this.contentIndexes().length > 0 &&
        this.answerResults().length === this.contentIndexes().length &&
        !!this.stepper() &&
        !this.started
      ) {
        setTimeout(() => {
          this.checkIfLastContentExists(
            this.route.snapshot.params.contentIndex - 1
          );
        });
      }
      const currentResults = this.answerResults();
      this.evaluateAnswerResultsState(prevAnswerResults, currentResults);
      prevAnswerResults = currentResults;
    });
  }

  evaluateAnswerResultsState(
    prevResults: ContentAnswerResult[],
    currentResults: ContentAnswerResult[]
  ) {
    const addedIndex = currentResults.findLastIndex((u) =>
      prevResults?.find(
        (p) =>
          p.result === AnswerResultState.Unanswered &&
          u.result !== AnswerResultState.Unanswered
      )
    );
    if (
      prevResults?.length > 0 &&
      addedIndex >= 0 &&
      !this.focusModeEnabled() &&
      this.started &&
      this.questionnaire().publishingMode !==
        QuestionnairePublishingMode.Live &&
      this.questionnaire().type !== QuestionnaireType.Quiz
    ) {
      setTimeout(() => {
        if (addedIndex < this.contents().length - 1) {
          this.nextContent();
          setTimeout(() => {
            document.getElementById('step')?.focus();
          }, 200);
        } else {
          this.goToOverview();
        }
      }, 1000);
    }
  }

  getIndexOfContentById(id: string): number {
    return this.contents()
      .map((c) => c.id)
      .indexOf(id);
  }

  finishLoading() {
    this.isLoading = false;
    this.isReloading = false;
  }

  announce(key: string) {
    this.announceService.announce(key);
  }

  checkIfLastContentExists(contentIndex?: number) {
    // Since `null >= 0` is `true` trough a type coercion with `ToPrimitive() this muste be checked seperately
    if (contentIndex !== undefined && (contentIndex == 0 || contentIndex > 0)) {
      this.initStepper(contentIndex);
    } else {
      if (!this.focusModeEnabled()) {
        this.getInitialStep();
      }
    }
  }

  initStepper(index: number, delay = 0) {
    setTimeout(() => {
      this.currentStep = index;
      if (this.stepper()) this.stepper()?.init(index, this.contents()?.length);
    }, delay);
    this.started = true;
  }

  goToContent(index: number) {
    this.stepper()?.setHeaderPosition(index);
    this.stepper()?.onClick(index);
    this.updateContentIndexUrl(index);
  }

  updateContentIndexUrl(index: number = 0) {
    if (this.currentStep !== index && (!!index || !this.isReloading)) {
      setTimeout(() => {
        this.currentStep = index || 0;
        this.replaceUrl([
          'p',
          this.shortId(),
          'series',
          this.questionnaire().name,
          index + 1,
        ]);
      }, STEPPER_ANIMATION_DURATION);
    }
  }

  private getInitialStep() {
    const firstIndex = this.getFirstUnansweredContentIndex();
    if (
      firstIndex === 0 ||
      (firstIndex &&
        !this.isPureInfoSeries() &&
        !this.contentCarouselService.isLastContentAnswered())
    ) {
      this.showOverview = false;
      this.initStepper(firstIndex || 0);
      this.updateContentIndexUrl(firstIndex);
    } else {
      this.showOverview = true;
    }
  }

  private isInfoContent(content: Content): boolean {
    return [ContentType.Slide, ContentType.Flashcard].includes(
      content.formatData.format
    );
  }

  private getFirstUnansweredContentIndex(): number | undefined {
    for (let i = 0; i < this.contents().length; i++) {
      const content = this.contents()[i];
      if (
        this.answerResults()[i].result === AnswerResultState.Unanswered &&
        !this.isInfoContent(content)
      ) {
        return i;
      }
    }
    return;
  }

  nextContent() {
    if (
      this.currentStep !== undefined &&
      this.currentStep < this.contents().length - 1 &&
      !this.isFinished()
    ) {
      this.stepper()?.next();
    } else {
      this.goToOverview();
    }
  }

  goToOverview() {
    this.showOverview = true;
    this.replaceUrl(['p', this.shortId(), 'series', this.questionnaire().name]);
  }

  replaceUrl(url: any[]) {
    const urlTree = this.router.createUrlTree(url);
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }

  getAttribution(): string | undefined {
    if (!this.attributions) {
      return;
    }
    const attribution = this.attributions.find(
      (a) =>
        this.currentStep !== undefined &&
        a.contentId === this.contents()[this.currentStep].id
    );
    if (!attribution || attribution.license === 'CC0-1.0') {
      return;
    }
    return this.translateService.translate(
      'participant.content.attribution-info',
      {
        attribution:
          attribution.attribution ||
          this.translateService.translate('general.anonymous'),
        license: LICENSES.get(attribution.license)?.name,
      }
    );
  }
}
