import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input,
  viewChild,
  output,
  computed,
  effect,
  linkedSignal,
} from '@angular/core';
import { ContentService } from '@app/core/services/http/content.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { DialogService } from '@app/core/services/util/dialog.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { MarkdownFeatureset } from '@app/core/services/http/formatting.service';
import { DragDropBaseComponent } from '@app/standalone/drag-drop-base/drag-drop-base.component';
import {
  CdkDragDrop,
  CdkDragSortEvent,
  CdkDropList,
  CdkDrag,
} from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FlexModule } from '@angular/flex-layout';
import { MatActionList, MatListItem } from '@angular/material/list';
import { NgClass, NgStyle, NgTemplateOutlet } from '@angular/common';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { MatIconButton } from '@angular/material/button';
import { TrackInteractionDirective } from '@app/core/directives/track-interaction.directive';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import {
  MatMenuTrigger,
  MatMenu,
  MatMenuItem,
  MatMenuContent,
} from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { HotkeyDirective } from '@app/core/directives/hotkey.directive';
import { PulsatingCircleComponent } from '@app/standalone/pulsating-circle/pulsating-circle.component';
import { A11yRenderedBodyPipe } from '@app/core/pipes/a11y-rendered-body.pipe';
import {
  Content,
  ContentType,
  CopyQuestionnaireContentToQuestionnaireGql,
  DeleteQuestionnaireAnswersByContentIdGql,
  DeleteQuestionnaireContentGql,
  DuplicateQuestionnaireContentGql,
  MoveQuestionnaireContentToQuestionnaireGql,
  PublishQuestionnaireUpToContentGql,
  Questionnaire,
  QuestionnaireByIdDocument,
  QuestionnaireContentsByQuestionnaireIdDocument,
  QuestionnairePublishingMode,
  QuestionnairesByRoomIdDocument,
  QuestionnaireRoundsByContentIdDocument,
  QuestionnairesByRoomIdGql,
  QuestionnaireSummaryFragment,
  QuestionnaireType,
  ResetBannedQuestionnaireWordcloudContentKeywordsGql,
  StartQuestionnaireContentGql,
  StartQuestionnaireContentRoundGql,
  StopQuestionnaireContentGql,
  UpdateQuestionnaireContentOrderGql,
} from '@gql/generated/graphql';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ContentResultsService } from '@app/standalone/content-results/content-results.service';
import { mutationHelper } from '@gql/helper/mutation-helper';
import { filter, map, Observable, of, switchMap } from 'rxjs';
import { RESULT_REGISTRY } from '@app/standalone/content-results/result-registry';

@Component({
  selector: 'app-content-list',
  templateUrl: './content-list.component.html',
  styleUrls: ['./content-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    FlexModule,
    MatActionList,
    CdkDropList,
    NgClass,
    ExtendedModule,
    MatListItem,
    CdkDrag,
    RouterLink,
    NgStyle,
    RenderedTextComponent,
    NgTemplateOutlet,
    MatIconButton,
    TrackInteractionDirective,
    MatTooltip,
    MatIcon,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatDivider,
    MatMenuContent,
    HotkeyDirective,
    PulsatingCircleComponent,
    A11yRenderedBodyPipe,
    TranslocoPipe,
  ],
})
export class ContentListComponent extends DragDropBaseComponent<Content> {
  private readonly contentService = inject(ContentService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslocoService);
  private readonly mutations = mutationHelper();
  private readonly dialogService = inject(DialogService);
  private readonly contentResultsService = inject(ContentResultsService);
  private readonly contentGroupService = inject(ContentGroupService);
  private readonly contentPublishService = inject(ContentPublishService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly deleteContentById = inject(DeleteQuestionnaireContentGql);
  private readonly deleteAnswersByContentId = inject(
    DeleteQuestionnaireAnswersByContentIdGql
  );
  private readonly resetBannedKeywords = inject(
    ResetBannedQuestionnaireWordcloudContentKeywordsGql
  );
  private readonly duplicateQuestionnaireContent = inject(
    DuplicateQuestionnaireContentGql
  );
  private readonly copyQuestionnaireContentToQuestionnaire = inject(
    CopyQuestionnaireContentToQuestionnaireGql
  );
  private readonly moveQuestionnaireContentToQuestionnaire = inject(
    MoveQuestionnaireContentToQuestionnaireGql
  );
  private readonly questionnairesByRoomId = inject(QuestionnairesByRoomIdGql);
  private readonly updateQuestionnaireContentOrder = inject(
    UpdateQuestionnaireContentOrderGql
  );
  private readonly startQuestionnaireContent = inject(
    StartQuestionnaireContentGql
  );
  private readonly startQuestionnaireContentRound = inject(
    StartQuestionnaireContentRoundGql
  );
  private readonly stopQuestionnaireContent = inject(
    StopQuestionnaireContentGql
  );
  private readonly publishQuestionnaireContentUpTo = inject(
    PublishQuestionnaireUpToContentGql
  );

  publishingDivider = viewChild<ElementRef>('publishingDivider');
  roomId = input.required<string>();
  questionnaire = input.required<Questionnaire>();
  contents = input.required<Content[]>();
  isModerator = input(false);
  attributionsExist = input(false);
  selectedContentId = input<string | undefined>();
  startedContentId = input<string | undefined>();
  startedContentChanged = output<string>();

  readonly questionnairesResult = toSignal(
    toObservable(this.roomId).pipe(
      switchMap((roomId) => {
        return this.questionnairesByRoomId.watch({
          variables: { roomId },
        }).valueChanges;
      })
    )
  );

  readonly questionnaires = computed(() => {
    return (
      this.questionnairesResult()?.data?.questionnairesByRoomId ?? []
    ).filter((n): n is QuestionnaireSummaryFragment => !!n);
  });

  sortableContents = linkedSignal(() => [...this.contents()]);

  publishedContentId = linkedSignal(
    () => this.questionnaire().publishedUpToContent?.id
  );

  /** Follows the divider, which moves before the server confirms it. */
  readonly publishedUpToPosition = computed(() => {
    const id = this.publishedContentId();
    return this.contents().find((c) => c.id === id)?.position ?? undefined;
  });

  contentTypes: string[] = Object.values(ContentType);

  activeMenuIndex?: number;
  activeContentId?: string;
  markdownFeatureset = MarkdownFeatureset.MINIMUM;

  ContentType: typeof ContentType = ContentType;
  QuestionnaireType = QuestionnaireType;

  iconList = computed(() => this.contentService.getTypeIcons());

  publishingChangeActive = false;
  publishingChangePosition?: number;

  constructor() {
    super();

    effect(() => {
      this.dragDroplist = [...this.sortableContents()];
    });
  }

  deleteContent(id: string, body: string) {
    const dialogRef = this.dialogService.openDeleteDialog(
      'content',
      'creator.dialog.really-delete-content',
      body,
      undefined,
      () =>
        this.deleteContentById
          .mutate({
            variables: { id },
            refetchQueries: [
              {
                query: QuestionnaireContentsByQuestionnaireIdDocument,
                variables: { questionnaireId: this.questionnaire().id },
              },
              QuestionnairesByRoomIdDocument,
            ],
          })
          .pipe(this.mutations.reportErrors())
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (this.selectedContentId() === id) {
          this.router.navigate(['.', this.getSuccessorId(id) ?? 'create'], {
            relativeTo: this.route,
            onSameUrlNavigation: 'reload',
            replaceUrl: true,
          });
        }
        const msg = this.translateService.translate(
          'creator.content.content-deleted'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      }
    });
  }

  /** The content taking the place of the deleted one, else the one before it. */
  private getSuccessorId(deletedId: string): string | undefined {
    const index = this.contents().findIndex((c) => c.id === deletedId);
    const remaining = this.contents().filter((c) => c.id !== deletedId);
    return remaining[Math.min(Math.max(index, 0), remaining.length - 1)]?.id;
  }

  deleteAnswers(content: Content) {
    this.dialogService.openDeleteDialog(
      'content-answers',
      'creator.dialog.really-delete-answers',
      undefined,
      undefined,
      () =>
        this.deleteAnswersByContentId
          .mutate({
            variables: { contentId: content.id },
            // The content starts over with a new round, which the results
            // views only learn about from its refetched rounds.
            update: () =>
              this.contentResultsService.clearPresentationSelectedRoundIds(
                content.id
              ),
            refetchQueries: [
              {
                query: QuestionnaireContentsByQuestionnaireIdDocument,
                variables: { questionnaireId: this.questionnaire().id },
              },
              {
                query: QuestionnaireRoundsByContentIdDocument,
                variables: { contentId: content.id },
              },
            ],
          })
          .pipe(this.mutations.reportErrors())
    );
  }

  isRangePublished(): boolean {
    return (
      this.questionnaire().published &&
      this.questionnaire().publishingMode !== QuestionnairePublishingMode.All
    );
  }

  isPublished(index: number): boolean {
    return this.contentPublishService.isIndexPublished(
      this.questionnaire().published,
      this.questionnaire().publishingMode,
      index,
      this.publishedUpToPosition()
    );
  }

  isLiveMode(): boolean {
    return this.contentPublishService.isLive(this.questionnaire());
  }

  supportsRounds(content: Content): boolean {
    return !!RESULT_REGISTRY[content.formatData.format].supportsRounds;
  }

  canModifyAnswersOrRounds(content: Content): boolean {
    if (!this.isLiveMode()) {
      return true;
    }
    return !!content.activeRound && content.activeRound.closed;
  }

  openedMenu(index: number) {
    this.activeMenuIndex = index;
  }

  closedMenu() {
    this.activeMenuIndex = undefined;
  }

  updateActive(contentId: string) {
    this.activeContentId = contentId;
  }

  resetBannedAnswers(contentId: string) {
    this.resetBannedKeywords
      .mutate({ variables: { contentId } })
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: () => {
          const msg = this.translateService.translate(
            'creator.content.banned-keywords-reset'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.WARNING
          );
        },
      });
  }

  private getSortIndex(
    index: number,
    indexIsNotPublishingIndex = true
  ): number {
    const publishingIndex = this.publishedUpToPosition();
    return (
      index -
      (this.isRangePublished() &&
      publishingIndex != null &&
      index > publishingIndex &&
      indexIsNotPublishingIndex
        ? 1
        : 0)
    );
  }

  dropContent(prev: number, current: number) {
    if (prev === current) {
      return;
    }
    const oldPublishingIndex = this.publishedUpToPosition();
    const prevContentIndex = this.getSortIndex(
      prev,
      prev !== oldPublishingIndex
    );
    const currentContentIndex = this.getSortIndex(current);
    const previousOrder = [...this.dragDroplist];
    this.moveItem(prevContentIndex, currentContentIndex);
    this.sortableContents.set(this.dragDroplist);
    this.updateQuestionnaireContentOrder
      .mutate({
        variables: {
          questionnaireId: this.questionnaire().id,
          contentIds: this.dragDroplist.map((content) => content.id),
        },
      })
      .pipe(this.mutations.reportErrors())
      .subscribe({
        error: () => {
          this.sortableContents.set(previousOrder);
          this.dragDroplist = previousOrder;
        },
      });
  }

  dropPublishingDivider(event: CdkDragDrop<Content[]>) {
    this.publishingChangeActive = false;
    this.publishingChangePosition = undefined;
    const newPublishingIndex = event.currentIndex - 1;
    if (this.publishedUpToPosition() !== newPublishingIndex) {
      this.updatePublishingRangeToIndex(newPublishingIndex);
    }
  }

  movePublishingDividerUp(index: number) {
    if (index > 0) {
      this.movePublishingDivider(index - 1);
    }
  }

  movePublishingDividerDown(index: number) {
    if (index < this.dragDroplist.length - 1) {
      this.movePublishingDivider(index + 1);
    }
  }

  private movePublishingDivider(index: number) {
    if (!this.isLiveMode()) {
      this.updatePublishingRangeToIndex(index);
      this.publishingDivider()?.nativeElement.focus();
    }
  }

  private updatePublishingRangeToIndex(index: number) {
    const publishToContentId = this.contents().find(
      (c) => c.position === index
    )?.id;
    if (!publishToContentId) {
      return;
    }
    this.publishedContentId.set(publishToContentId);
    this.publishQuestionnaireContentUpTo
      .mutate({
        variables: {
          questionnaireId: this.questionnaire().id,
          contentId: publishToContentId,
        },
      })
      .pipe(this.mutations.reportErrors())
      .subscribe({
        error: () => {
          this.publishedContentId.set(
            this.questionnaire().publishedUpToContent?.id
          );
        },
      });
  }

  onSortChanged(event: CdkDragSortEvent) {
    if (this.publishingChangeActive) {
      this.publishingChangePosition = event.currentIndex;
    }
    this.changeDetectorRef.detectChanges();
  }

  getPercentageString(value?: number): string {
    return value?.toFixed() + '\u202F%';
  }

  isCompatibleWithQuestionnaireType(
    content: Content,
    groupType: QuestionnaireType
  ): boolean {
    return this.contentGroupService.isContentCompatibleWithQuestionnaireType(
      content,
      groupType
    );
  }

  duplicateContent(id: string) {
    this.duplicateQuestionnaireContent
      .mutate({
        variables: { id },
        refetchQueries: [
          {
            query: QuestionnaireContentsByQuestionnaireIdDocument,
            variables: { questionnaireId: this.questionnaire().id },
          },
          QuestionnairesByRoomIdDocument,
        ],
      })
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: (r) => {
          if (r.data?.duplicateQuestionnaireContent) {
            const msg = this.translateService.translate(
              'creator.content.content-has-been-duplicated'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
          }
        },
        error: (e) => this.notificationService.showOnRequestClientError(e),
      });
  }

  private executeContentAction(
    action: 'copy' | 'move',
    contentId: string,
    target: { id: string; name: string } | undefined,
    mutation: (
      contentId: string,
      questionnaireId: string
    ) => Observable<unknown>
  ) {
    const questionnaire$ = target
      ? of(target)
      : this.dialogService
          .openQuestionnaireCreationDialog(this.roomId())
          .afterClosed();

    questionnaire$
      .pipe(
        filter((q): q is { id: string; name: string } => !!q),

        switchMap((q) =>
          mutation(contentId, q.id).pipe(
            this.mutations.handleErrors(),
            map(() => q)
          )
        )
      )
      .subscribe({
        next: (q) => {
          const msg = this.translateService.translate(
            `creator.content.${action === 'copy' ? 'copied' : 'moved'}-to-content-group`,
            { series: q.name }
          );

          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
        },
      });
  }

  performContentAction(
    action: 'copy' | 'move',
    contentId: string,
    target?: { id: string; name: string }
  ) {
    this.executeContentAction(
      action,
      contentId,
      target,
      (contentId, questionnaireId) =>
        action === 'copy'
          ? this.copyQuestionnaireContentToQuestionnaire.mutate({
              variables: { contentId, questionnaireId },
              refetchQueries: [QuestionnairesByRoomIdDocument],
            })
          : this.moveQuestionnaireContentToQuestionnaire.mutate({
              variables: { contentId, questionnaireId },
              refetchQueries: [
                {
                  query: QuestionnaireContentsByQuestionnaireIdDocument,
                  variables: { questionnaireId: this.questionnaire().id },
                },
                QuestionnairesByRoomIdDocument,
              ],
            })
    );
  }

  startContent(contentId: string) {
    this.startQuestionnaireContent
      .mutate({ variables: { contentId } })
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: (r) => {
          if (r.data?.startQuestionnaireContent) {
            this.startedContentChanged.emit(contentId);
            const msg = this.translateService.translate(
              'creator.content.content-started'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
          }
        },
      });
  }

  stopContent() {
    this.stopQuestionnaireContent
      .mutate({ variables: { questionnaireId: this.questionnaire().id } })
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: (r) => {
          if (r.data?.stopQuestionnaireContent) {
            const msg = this.translateService.translate(
              'creator.content.content-stopped'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.WARNING
            );
          }
        },
      });
  }

  startNewRound(contentId: string) {
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
              variables: { questionnaireId: this.questionnaire().id },
            },
            {
              query: QuestionnaireByIdDocument,
              variables: { id: this.questionnaire().id },
            },
          ],
        })
        .pipe(this.mutations.reportErrors())
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.startedContentChanged.emit(contentId);
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
}
