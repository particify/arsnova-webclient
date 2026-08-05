import {
  Component,
  ViewChild,
  computed,
  inject,
  input,
  output,
  ChangeDetectionStrategy,
  afterNextRender,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { onlyCompleteData } from 'apollo-angular';
import { MatMenu } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { ContentService } from '@app/core/services/http/content.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@jsverse/transloco';
import {
  Content,
  ContentType,
  DeleteQuestionnaireAnswersByContentIdGql,
  QuestionnaireByIdDocument,
  QuestionnaireByIdGql,
  QuestionnaireContentsByQuestionnaireIdDocument,
  QuestionnairePublishingMode,
  QuestionnaireRoundsByContentIdDocument,
  QuestionnaireRoundsByContentIdGql,
  StartQuestionnaireContentRoundGql,
} from '@gql/generated/graphql';
import { ContentResultsService } from '@app/standalone/content-results/content-results.service';
import { RESULT_REGISTRY } from '@app/standalone/content-results/result-registry';
import {
  sortedRoundNumbers,
  toggleRoundSelection,
} from '@app/standalone/round-selector/round-selection';

@Component({
  selector: 'app-content-presentation-menu',
  imports: [CoreModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './content-presentation-menu.component.html',
})
export class ContentPresentationMenuComponent {
  private contentService = inject(ContentService);
  private presentationService = inject(PresentationService);
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private translateService = inject(TranslocoService);
  private deleteAnswersByContentId = inject(
    DeleteQuestionnaireAnswersByContentIdGql
  );
  private startQuestionnaireContentRound = inject(
    StartQuestionnaireContentRoundGql
  );
  private questionnaireById = inject(QuestionnaireByIdGql);
  private questionnaireRoundsByContentId = inject(
    QuestionnaireRoundsByContentIdGql
  );
  private contentResultsService = inject(ContentResultsService);

  @ViewChild('moreMenu') moreMenu!: MatMenu;

  content = input.required<Content>();
  questionnaireId = input.required<string>();
  shortId = input.required<string>();
  editingEnabled = input(true);
  settingsEnabled = input(true);
  menuLoaded = output<void>();

  private readonly questionnaireResult = toSignal(
    toObservable(this.questionnaireId).pipe(
      switchMap(
        (id) => this.questionnaireById.watch({ variables: { id } }).valueChanges
      )
    )
  );

  private readonly isLiveMode = computed(
    () =>
      this.questionnaireResult()?.data?.questionnaireById?.publishingMode ===
      QuestionnairePublishingMode.Live
  );

  readonly rounds = toSignal(
    toObservable(computed(() => this.content().id)).pipe(
      switchMap(
        (contentId) =>
          this.questionnaireRoundsByContentId.watch({
            variables: { contentId },
          }).valueChanges
      ),
      onlyCompleteData(),
      map((r) => r.data.questionnaireRoundsByContentId ?? [])
    ),
    { initialValue: [] }
  );

  readonly allowNewRound = computed(
    () => !!RESULT_REGISTRY[this.content().formatData.format].supportsRounds
  );

  readonly allowRoundComparison = computed(
    () =>
      !!RESULT_REGISTRY[this.content().formatData.format]
        .supportsRoundComparison
  );

  private readonly currentRound = computed(() => {
    const rounds = this.rounds();
    return rounds.length ? rounds[rounds.length - 1] : undefined;
  });

  readonly selectedRoundIds = computed(() => {
    const rounds = this.rounds();
    const storedRoundIds =
      this.contentResultsService.presentationSelectedRoundIds(
        this.content().id
      );
    if (storedRoundIds?.length) {
      return storedRoundIds;
    }
    return rounds.length ? [rounds[rounds.length - 1].id] : [];
  });

  readonly roundsLabel = computed(() =>
    sortedRoundNumbers(this.rounds(), this.selectedRoundIds()).join(' & ')
  );

  destroyed$ = new Subject<void>();

  ContentType: typeof ContentType = ContentType;

  rotateWordcloudItems?: boolean;

  constructor() {
    this.presentationService
      .getWordcloudVisualizationChanged()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((rotateWordcloudItems) => {
        this.rotateWordcloudItems = rotateWordcloudItems;
      });
    afterNextRender(() => {
      this.menuLoaded.emit();
    });
  }

  hasFormatAnswer(format: ContentType): boolean {
    return ![ContentType.Slide, ContentType.Flashcard].includes(format);
  }

  hasFormatCloudVisualization(): boolean {
    return this.content().formatData.format === ContentType.Wordcloud;
  }

  toggleRound(roundId: string) {
    this.contentResultsService.setPresentationSelectedRoundIds(
      this.content().id,
      toggleRoundSelection(
        this.selectedRoundIds(),
        roundId,
        this.allowRoundComparison()
      )
    );
  }

  editContent() {
    this.contentService.goToEdit(
      this.content().id,
      this.shortId(),
      this.questionnaireId()
    );
  }

  hasClosedRound(): boolean {
    if (!this.isLiveMode()) {
      return true;
    }
    const currentRound = this.currentRound();
    return !!currentRound && currentRound.closed;
  }

  deleteContentAnswers() {
    const contentId = this.content().id;
    this.dialogService.openDeleteDialog(
      'content-answers',
      'creator.dialog.really-delete-answers',
      undefined,
      undefined,
      () =>
        this.deleteAnswersByContentId.mutate({
          variables: { contentId },
          refetchQueries: [
            {
              query: QuestionnaireContentsByQuestionnaireIdDocument,
              variables: { questionnaireId: this.questionnaireId() },
            },
          ],
        })
    );
  }

  startNewRound() {
    const contentId = this.content().id;
    const dialogRef = this.dialogService.openStartNewRoundDialog(() =>
      this.startQuestionnaireContentRound
        .mutate({
          variables: { contentId },
          refetchQueries: [
            {
              query: QuestionnaireRoundsByContentIdDocument,
              variables: { contentId },
            },
            {
              query: QuestionnaireContentsByQuestionnaireIdDocument,
              variables: { questionnaireId: this.questionnaireId() },
            },
            {
              query: QuestionnaireByIdDocument,
              variables: { id: this.questionnaireId() },
            },
          ],
        })
        .pipe(
          tap({
            error: (e) => this.notificationService.showOnRequestClientError(e),
          })
        )
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const msg = this.translateService.translate(
          'creator.content.new-round-started'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
      }
    });
  }

  changeWordcloudVisualization() {
    this.rotateWordcloudItems = !this.rotateWordcloudItems;
    this.presentationService.updateWordcloudVisualization(
      this.rotateWordcloudItems
    );
  }
}
