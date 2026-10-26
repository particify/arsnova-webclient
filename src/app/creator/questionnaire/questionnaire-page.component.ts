import { BreakpointObserver } from '@angular/cdk/layout';
import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { UserRole } from '@app/core/models/user-roles.enum';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import {
  DIALOG_SIZES,
  DialogService,
} from '@app/core/services/util/dialog.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { LocalFileService } from '@app/core/services/util/local-file.service';
import {
  ContentCsvImportError,
  ContentCsvImportErrorReason,
  ContentCsvImportResult,
} from '@app/core/models/content-csv-import-result';
import { QuestionnaireCsvService } from '@app/core/services/http/questionnaire-csv.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { CreateContentGroupTemplateComponent } from '@app/creator/questionnaire/_dialogs/create-content-group-template/create-content-group-template.component';
import { ExportOptions } from '@app/creator/questionnaire/_dialogs/export/export.component';
import { BaseDialogComponent } from '@app/standalone/_dialogs/base-dialog/base-dialog.component';
import { QuestionnaireSettingsComponent } from '@app/standalone/questionnaire-settings/questionnaire-settings.component';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { ContentResultsService } from '@app/standalone/content-results/content-results.service';
import { mutationHelper } from '@gql/helper/mutation-helper';
import { evictRounds } from '@gql/helper/evict-round-stats';
import { Apollo } from 'apollo-angular';
import {
  switchMap,
  map,
  filter,
  catchError,
  ignoreElements,
  EMPTY,
  tap,
  take,
} from 'rxjs';
import { FlexModule } from '@angular/flex-layout';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { HotkeyDirective } from '@app/core/directives/hotkey.directive';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { ExtensionPointComponent } from '@projects/extension-point/src/lib/extension-point.component';
import { TrackInteractionDirective } from '@app/core/directives/track-interaction.directive';
import { FeatureFlagDirective } from '@app/core/directives/feature-flag.directive';
import { MatDivider } from '@angular/material/divider';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatCard } from '@angular/material/card';
import { BackButtonComponent } from '@app/standalone/back-button/back-button.component';
import {
  CreatorContentDetailsFragment,
  CreatorQuestionnaireContentUpdatedGql,
  DeleteQuestionnaireGql,
  QuestionnaireByIdDocument,
  QuestionnaireDetailsFragment,
  QuestionnaireContentsByQuestionnaireIdDocument,
  QuestionnaireByIdGql,
  QuestionnaireContentsByQuestionnaireIdGql,
  QuestionnairePublishingMode,
  QuestionnaireType,
  QuestionnaireUpdatedGql,
  ResetQuestionnaireResultsGql,
  ToggleQuestionnairePublishedGql,
} from '@gql/generated/graphql';
import { QuestionnaireInfoComponent } from '@app/standalone/questionnaire-info/questionnaire-info.component';
import { ContentListComponent } from './content-list/content-list.component';
import { QuestionnairePageService } from './questionnaire-page.service';
import { RoutingService } from '@app/core/services/util/routing.service';

const STATUS_OKAY = 50;
const STATUS_BETTER = 62.5;
const STATUS_GOOD = 75;
const STATUS_EXCELLENT = 87.5;

const IMPORT_MEDIA_TYPES = [
  '.csv',
  '.tsv',
  'text/csv',
  'text/tab-separated-values',
];

// The server rejects larger files.
const MAX_IMPORT_FILE_SIZE = 1024 * 1024;
const MAX_IMPORT_FILE_SIZE_LABEL = '1 MB';

const IMPORT_ERROR_MESSAGES: Record<ContentCsvImportErrorReason, string> = {
  [ContentCsvImportErrorReason.INCOMPATIBLE_FORMAT]:
    'creator.dialog.csv-import-error-incompatible-format',
  [ContentCsvImportErrorReason.INVALID_FORMAT_DATA]:
    'creator.dialog.csv-import-error-invalid-format-data',
  [ContentCsvImportErrorReason.MALFORMED_RECORD]:
    'creator.dialog.csv-import-error-malformed-record',
  [ContentCsvImportErrorReason.MISSING_BODY]:
    'creator.dialog.csv-import-error-missing-body',
  [ContentCsvImportErrorReason.UNKNOWN_FORMAT]:
    'creator.dialog.csv-import-error-unknown-format',
};

export interface ContentStats {
  count: number;
  correct?: number;
  abstentions?: number;
}

/** The share of correct answers in percent, if the content has any to score. */
function correctPercentage(
  content: CreatorContentDetailsFragment
): number | undefined {
  if (
    !content.hasCorrectAnswer ||
    content.correctAnswerCount == null ||
    !content.answerCount
  ) {
    return undefined;
  }
  return (content.correctAnswerCount / content.answerCount) * 100;
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

@Component({
  selector: 'app-questionnaire-page',
  templateUrl: './questionnaire-page.component.html',
  styleUrls: ['./questionnaire-page.component.scss'],
  imports: [
    FlexModule,
    LoadingIndicatorComponent,
    MatButton,
    HotkeyDirective,
    RouterLink,
    MatIcon,
    MatIconButton,
    MatTooltip,
    NgClass,
    ExtendedModule,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    ExtensionPointComponent,
    TrackInteractionDirective,
    FeatureFlagDirective,
    MatDivider,
    MatProgressBar,
    MatCard,
    RouterOutlet,
    BackButtonComponent,
    TranslocoPipe,
    QuestionnaireInfoComponent,
    ContentListComponent,
  ],
})
export class QuestionnairePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslocoService);
  private readonly mutations = mutationHelper();
  private readonly globalStorageService = inject(GlobalStorageService);
  private readonly router = inject(Router);
  private readonly routingService = inject(RoutingService);
  private readonly localFileService = inject(LocalFileService);
  private readonly dialogService = inject(DialogService);
  private readonly contentResultsService = inject(ContentResultsService);
  private readonly authService = inject(AuthenticationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly toggleQuestionnairePublished = inject(
    ToggleQuestionnairePublishedGql
  );
  private readonly contentsByQuestionnareId = inject(
    QuestionnaireContentsByQuestionnaireIdGql
  );
  private readonly deleteQuestionnaire = inject(DeleteQuestionnaireGql);
  private readonly questionnairePageService = inject(QuestionnairePageService);
  private readonly resetQuestionnaireResults = inject(
    ResetQuestionnaireResultsGql
  );
  private readonly questionnaireById = inject(QuestionnaireByIdGql);
  private readonly questionnaireContentUpdated = inject(
    CreatorQuestionnaireContentUpdatedGql
  );
  private readonly questionnaireUpdated = inject(QuestionnaireUpdatedGql);
  private readonly apollo = inject(Apollo);
  private readonly csvService = inject(QuestionnaireCsvService);

  readonly userRole = input.required<UserRole>();
  readonly roomId = input.required<string>();
  readonly questionnaireId = input.required<string>();
  readonly shortId = input.required<string>();
  readonly published = computed(() => this.questionnaire()?.published ?? false);
  readonly isModerator = computed(() => this.userRole() === UserRole.MODERATOR);
  readonly questionnaire = toSignal(
    toObservable(this.questionnaireId).pipe(
      switchMap((id) =>
        this.questionnaireById.watch({ variables: { id } }).valueChanges.pipe(
          map((r) => r.data?.questionnaireById),
          filter((n): n is QuestionnaireDetailsFragment => !!n)
        )
      )
    )
  );
  private readonly contentsKey = computed(() =>
    [this.questionnaireId(), this.questionnaire()?.activeRound?.id].join('|')
  );
  readonly contentsResult = toSignal(
    toObservable(this.contentsKey).pipe(
      switchMap(() => {
        return this.contentsByQuestionnareId.watch({
          variables: { questionnaireId: this.questionnaireId() },
          fetchPolicy: 'network-only',
        }).valueChanges;
      })
    )
  );
  private readonly contentUpdates = toSignal(
    toObservable(this.questionnaireId).pipe(
      switchMap((questionnaireId) =>
        this.questionnaireContentUpdated
          .subscribe({ variables: { questionnaireId } })
          .pipe(
            ignoreElements(),
            catchError(() => EMPTY)
          )
      )
    )
  );
  private readonly questionnaireUpdates = toSignal(
    toObservable(this.questionnaireId).pipe(
      switchMap((questionnaireId) =>
        this.questionnaireUpdated
          .subscribe({ variables: { questionnaireId } })
          .pipe(
            ignoreElements(),
            catchError(() => EMPTY)
          )
      )
    )
  );
  readonly contents = computed(() => {
    const edges =
      this.contentsResult()?.data?.questionnaireContentsByQuestionnaireId
        ?.edges;
    return (
      edges
        ?.map((e) => e?.node)
        .filter((n): n is CreatorContentDetailsFragment => !!n) ?? []
    );
  });
  readonly loadingContents = computed(() => this.contentsResult()?.loading);
  /** The average share of correct answers over the scorable contents. */
  readonly totalCorrect = computed(() => {
    const percentages = this.contents()
      .map(correctPercentage)
      .filter((p): p is number => p !== undefined);
    return percentages.length
      ? Math.round(sum(percentages) / percentages.length)
      : undefined;
  });
  /** The share of abstentions over the scorable contents. */
  readonly totalAbstentions = computed(() => {
    const scorable = this.contents().filter((c) => c.hasCorrectAnswer);
    const abstentions = sum(scorable.map((c) => c.abstentionCount ?? 0));
    const responses =
      abstentions + sum(scorable.map((c) => c.answerCount ?? 0));
    return responses ? Math.round((abstentions / responses) * 100) : 0;
  });
  readonly progressColor = computed(() => {
    const totalCorrect = this.totalCorrect();
    if (!totalCorrect) {
      return '';
    } else if (totalCorrect < STATUS_OKAY) {
      return 'red';
    } else if (totalCorrect < STATUS_BETTER) {
      return 'orange';
    } else if (totalCorrect < STATUS_GOOD) {
      return 'yellow';
    } else if (totalCorrect < STATUS_EXCELLENT) {
      return 'green';
    }
    return 'blue';
  });

  isLoading = true;

  readonly isGuest = toSignal(
    this.authService.getCurrentAuthentication().pipe(map((a) => !a?.verified)),
    { initialValue: true }
  );

  attributionsExist = false;
  QuestionnaireType = QuestionnaireType;
  readonly showLeaderboard = signal(false);
  showAttributions = false;
  readonly creationMode = signal(false);
  readonly editMode = signal(false);
  selectedContentId = signal<string | undefined>(undefined);
  readonly isDesktop = signal<boolean | undefined>(undefined);
  readonly childActive = signal(false);

  constructor() {
    this.router.events
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this.determinateRouteState();
      });
    this.questionnairePageService
      .getEditedContent()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.router.navigate(['.'], { relativeTo: this.route });
      });
    effect(() => {
      if (!this.loadingContents()) {
        // The route state is kept current by the router events and the
        // breakpoint, so only the contents and the selection drive this.
        this.contents();
        this.selectedContentId();
        untracked(() => {
          this.determinateRouteState();
          this.navigateToFirstContent();
          if (this.contents().length === 0 && this.isDesktop()) {
            this.openCreation();
          }
        });
      }
      if (this.questionnaire()) {
        this.globalStorageService.setItem(
          STORAGE_KEYS.LAST_GROUP,
          this.questionnaire()?.id
        );
      }
    });
    this.breakpointObserver
      .observe(['(min-width: 1000px)'])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((changes) => {
        const temp = this.isDesktop();
        this.isDesktop.set(changes.matches);
        if (temp !== undefined && temp !== changes.matches) {
          this.determinateRouteState();
          this.navigateToFirstContent();
          if (this.contents().length === 0 && this.isDesktop()) {
            this.openCreation();
          }
        }
      });
  }

  private determinateRouteState() {
    const child = this.route.firstChild;
    const childPath = child?.snapshot.routeConfig?.path;
    this.showLeaderboard.set(childPath === 'leaderboard');
    this.showAttributions = childPath === 'attributions';
    this.creationMode.set(childPath === 'create');
    this.editMode.set(!!childPath?.includes('edit'));
    if (childPath === 'attributions' && this.isDesktop()) {
      this.selectedContentId.set(undefined);
    }
    this.childActive.set(!!child);
    this.evaluateRouteStateChild(child, childPath);
  }

  private evaluateRouteStateChild(
    route: ActivatedRoute | null,
    path: string | undefined
  ) {
    if (!route) {
      if (this.selectedContentId() !== undefined && this.isDesktop()) {
        this.router.navigate([this.selectedContentId()], {
          relativeTo: this.route,
          replaceUrl: true,
        });
      }
      return;
    }
    if (path) {
      const contentId = route.snapshot.params.contentId;
      if (contentId) {
        this.selectedContentId.set(contentId);
      }
    }
  }

  private navigateToFirstContent() {
    const questionnaire = this.questionnaire();
    if (
      questionnaire &&
      this.isDesktop() &&
      this.selectedContentId() === undefined &&
      !this.showLeaderboard() &&
      !this.showAttributions &&
      !this.creationMode() &&
      !this.editMode() &&
      this.contents().length > 0
    ) {
      this.router.navigate(
        [this.startedContentId(questionnaire) ?? this.contents()[0].id],
        { relativeTo: this.route, replaceUrl: true }
      );
    }
  }

  /** The content a live questionnaire is running, if it is one of the list. */
  private startedContentId(
    questionnaire: QuestionnaireDetailsFragment
  ): string | undefined {
    const round = questionnaire.activeRound;
    if (
      questionnaire.publishingMode !== QuestionnairePublishingMode.Live ||
      !round?.contentId ||
      round.closed
    ) {
      return undefined;
    }
    return this.contents().some((c) => c.id === round.contentId)
      ? round.contentId
      : undefined;
  }

  generateExportFilename(extension: string): string {
    const questionnaireName = this.questionnaire()?.name ?? '';
    const name = this.localFileService.generateFilename(
      [questionnaireName, this.shortId()],
      true
    );
    return `${name}.${extension}`;
  }

  exportToCsv() {
    this.dialogService
      .openExportDialog()
      .afterClosed()
      .pipe(filter((options): options is ExportOptions => !!options))
      .subscribe((options) =>
        // Named .csv whatever the delimiter, as before.
        this.localFileService.download(
          this.csvService.exportContents(
            this.questionnaireId(),
            options.exportType,
            options.charset
          ),
          this.generateExportFilename('csv')
        )
      );
  }

  importFromCsv() {
    this.localFileService
      .upload(IMPORT_MEDIA_TYPES)
      .pipe(
        take(1),
        filter((file): file is Blob => !!file),
        filter((file) => this.isImportFileSizeAccepted(file)),
        switchMap((file) =>
          this.csvService.importContents(this.questionnaireId(), file)
        ),
        // The service has reported a rejected file already.
        catchError(() => EMPTY)
      )
      .subscribe((result) => {
        this.showImportResult(result);
        this.apollo.client.refetchQueries({
          include: [
            QuestionnaireContentsByQuestionnaireIdDocument,
            QuestionnaireByIdDocument,
          ],
        });
      });
  }

  private isImportFileSizeAccepted(file: Blob): boolean {
    if (file.size <= MAX_IMPORT_FILE_SIZE) {
      return true;
    }
    this.notificationService.showAdvanced(
      this.translateService.translate('creator.content.import-file-too-large', {
        size: MAX_IMPORT_FILE_SIZE_LABEL,
      }),
      AdvancedSnackBarTypes.FAILED
    );
    return false;
  }

  private showImportResult(result: ContentCsvImportResult) {
    const unknownColumns = result.unknownColumns ?? [];
    if (
      result.errorLines.length === 0 &&
      unknownColumns.length === 0 &&
      result.importedLines >= result.totalLines
    ) {
      this.notificationService.showAdvanced(
        this.translateService.translate('creator.content.import-successful'),
        AdvancedSnackBarTypes.SUCCESS
      );
      return;
    }
    this.dialogService.openDialog(BaseDialogComponent, {
      width: DIALOG_SIZES.small,
      data: {
        dialogId: 'csv-import-result',
        headerLabel: 'creator.dialog.csv-import-errors-header',
        body: this.translateService.translate(
          'creator.dialog.csv-import-errors',
          {
            importedLines: result.importedLines,
            totalLines: result.totalLines,
          }
        ),
        additionalBody: [
          this.describeUnknownColumns(unknownColumns),
          this.describeImportErrors(result.errorLines),
        ]
          .filter((description) => !!description)
          .join(' '),
        confirmLabel: 'dialog.close',
        type: 'button-primary',
      },
    });
  }

  private describeUnknownColumns(columns: string[]): string {
    if (columns.length === 0) {
      return '';
    }
    return this.translateService.translate(
      'creator.dialog.csv-import-unknown-columns',
      { columns: columns.join(', ') }
    );
  }

  /** `line` counts entries after the header row, not lines of the file. */
  private describeImportErrors(errors: ContentCsvImportError[]): string {
    const entriesByReason = new Map<ContentCsvImportErrorReason, number[]>();
    for (const error of errors) {
      const entries = entriesByReason.get(error.reason) ?? [];
      entriesByReason.set(error.reason, [...entries, error.line]);
    }
    return [...entriesByReason]
      .map(([reason, entries]) =>
        this.translateService.translate(IMPORT_ERROR_MESSAGES[reason], {
          entries: entries.join(', '),
        })
      )
      .join(' ');
  }

  deleteAllAnswers() {
    const dialogRef = this.dialogService.openDeleteDialog(
      'content-answers',
      'creator.dialog.really-reset-group-results',
      undefined,
      undefined,
      () =>
        this.resetQuestionnaireResults
          .mutate({
            variables: { id: this.questionnaireId() },
            update: () =>
              this.contentResultsService.clearPresentationSelectedRoundIds(),
            // Every content starts over with a new round, which the refetched
            // contents reference as their active round.
            refetchQueries: [
              {
                query: QuestionnaireContentsByQuestionnaireIdDocument,
                variables: { questionnaireId: this.questionnaireId() },
              },
            ],
            awaitRefetchQueries: true,
          })
          .pipe(
            // The cached rounds and their stats are those of deleted rounds.
            tap(() => evictRounds(this.apollo.client.cache)),
            this.mutations.reportErrors()
          )
    );
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          const msg = this.translateService.translate(
            'creator.content.results-have-been-reset'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.WARNING
          );
        }
      },
    });
  }

  deleteGroup() {
    const dialogRef = this.dialogService.openDeleteDialog(
      'content-group',
      'creator.dialog.really-delete-content-group',
      this.questionnaire()?.name,
      undefined,
      () =>
        this.deleteQuestionnaire
          .mutate({
            variables: { id: this.questionnaireId() },
            update: (cache, result) => {
              if (result.data?.deleteQuestionnaire) {
                const cacheId = cache.identify({
                  __typename: 'Questionnaire',
                  id: this.questionnaireId(),
                });
                if (cacheId) {
                  cache.evict({ id: cacheId });
                  cache.gc();
                }
              }
            },
          })
          .pipe(this.mutations.reportErrors())
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigate([
          this.routingService.getRoleRoute(),
          this.shortId(),
        ]);
        this.globalStorageService.removeItem(STORAGE_KEYS.LAST_GROUP);
        const msg = this.translateService.translate(
          'creator.content.content-group-deleted'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      }
    });
  }

  publish(): void {
    this.toggleQuestionnairePublished
      .mutate({
        variables: { id: this.questionnaireId(), published: true },
      })
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: (r) => {
          if (r.data?.toggleQuestionnairePublished) {
            const msg = this.translateService.translate(
              'creator.content.group-published'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
          }
        },
      });
  }

  createTemplate() {
    this.dialogService.openDialog(CreateContentGroupTemplateComponent, {
      width: '600px',
      data: {
        name: this.questionnaire()?.name,
        questionnaireId: this.questionnaireId(),
      },
    });
  }

  openSettings(): void {
    const dialogRef = this.dialogService.openDialog(
      QuestionnaireSettingsComponent,
      {
        width: '600px',
        data: {
          questionnaire: { ...this.questionnaire() },
          alreadyAnswered: this.contents().some((c) => c.hasAnswers),
        },
      }
    );
    dialogRef.afterClosed().subscribe((contentGroup) => {
      if (contentGroup) {
        const msg = this.translateService.translate(
          'creator.content.changes-made'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
      }
    });
  }

  navToContent(id: string): void {
    if (this.selectedContentId() !== id) {
      this.router.navigate(['.', id], { relativeTo: this.route });
    }
  }

  isLiveMode(): boolean {
    return (
      this.questionnaire()?.publishingMode === QuestionnairePublishingMode.Live
    );
  }

  toggleLeaderboard() {
    const url = ['.'];
    if (this.showLeaderboard()) {
      const selectedContentId = this.selectedContentId();
      if (selectedContentId !== undefined) {
        url.push(selectedContentId);
      }
    } else {
      url.push('leaderboard');
    }
    this.router.navigate(url, {
      relativeTo: this.route,
    });
    this.showLeaderboard.update((shown) => !shown);
  }

  private openCreation() {
    this.router.navigate(['create'], {
      relativeTo: this.route,
      replaceUrl: true,
    });
  }
}
