import {
  Component,
  DestroyRef,
  WritableSignal,
  computed,
  inject,
  input,
  signal,
  effect,
} from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { Room } from '@app/core/models/room';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import {
  auditTime,
  catchError,
  debounceTime,
  filter,
  fromEvent,
  of,
  Subject,
  switchMap,
} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { CommentSort } from '@app/core/models/comment-sort.enum';
import { CommentFilter } from '@app/core/models/comment-filter.enum';
import { CreateCommentComponent } from '@app/standalone/_dialogs/create-comment/create-comment.component';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';
import {
  ActiveQnaPostUpdatedGql,
  CorrectState,
  Exact,
  ModerationState,
  Post,
  PostEdge,
  PostSortOrder,
  QnaPostAcceptedGql,
  QnaPostCountsByQnaIdDocument,
  QnaPostCountsByQnaIdGql,
  QnaPostCountsByQnaIdQuery,
  QnaPostCountsByQnaIdQueryVariables,
  QnaPostCreatedGql,
  QnaPostDeletedGql,
  QnaPostMarkedCorrectGql,
  QnaPostMarkedFavoriteGql,
  QnaPostRejectedGql,
  QnaPostRepliedGql,
  QnaPostsByQnaIdGql,
  QnaPostsByQnaIdQuery,
  QnaPostVotedGql,
  QnasByRoomIdGql,
  QnaStateChangedGql,
  QnaState,
  Tag,
} from '@gql/generated/graphql';
import { Apollo, QueryRef } from 'apollo-angular';
import { NetworkStatus } from '@apollo/client';

export const itemRenderNumber = 20;

export const BAR_PADDING = 16;
const APP_PADDING = innerWidth < 600 ? 16 : 24;

const THROTTLE = 1000;
@Component({
  template: '',
  standalone: false,
})
export class AbstractCommentsPageComponent {
  protected translateService = inject(TranslocoService);
  protected dialog = inject(MatDialog);
  protected wsCommentService = inject(WsCommentService);
  protected notificationService = inject(NotificationService);
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  protected globalStorageService = inject(GlobalStorageService);
  protected qnasByRoomId = inject(QnasByRoomIdGql);
  protected roomSettingsService = inject(RoomSettingsService);
  protected postsByQna = inject(QnaPostsByQnaIdGql);
  private postCounts = inject(QnaPostCountsByQnaIdGql);
  protected postCreated = inject(QnaPostCreatedGql);
  protected postDeleted = inject(QnaPostDeletedGql);
  protected postAccepted = inject(QnaPostAcceptedGql);
  protected postRejected = inject(QnaPostRejectedGql);
  protected postReplied = inject(QnaPostRepliedGql);
  protected postMarkedFavorite = inject(QnaPostMarkedFavoriteGql);
  protected postMarkedCorrect = inject(QnaPostMarkedCorrectGql);
  protected postVoted = inject(QnaPostVotedGql);
  protected qnaStateChanged = inject(QnaStateChangedGql);
  protected activePostUpdated = inject(ActiveQnaPostUpdatedGql);
  protected destroyed$ = inject(DestroyRef);
  protected readonly apollo = inject(Apollo);
  room = input.required<Room>();
  roomId = input.required<string>();

  isModeration = signal(this.route.snapshot.data.isModeration);

  readonly queryVars = computed(() => ({
    qnaId: this.qnaId()!,
    search: this.search(),
    tagIds: this.selectedTags()?.map((t) => t.id),
    favorite: this.selectedFavoriteFilter(),
    correct: this.selectedCorrectFilter(),
    replied: this.selectedRepliedFilter(),
    period: this.selectedPeriodFilter(),
    sortOrder: this.selectedSortOrder(),
    moderationState: this.isModeration()
      ? ModerationState.Rejected
      : ModerationState.Accepted,
  }));

  protected qnaResult = toSignal(
    toObservable(this.roomId).pipe(
      switchMap((roomId) => {
        return this.qnasByRoomId.watch({
          variables: {
            roomId,
          },
        }).valueChanges;
      }),
      filter((r) => r.dataState === 'complete'),
      catchError(() => of())
    )
  );

  protected qnaData = computed(() => {
    const qna = this.qnaResult()?.data.qnasByRoomId;
    if (qna?.edges && qna.edges[0]) {
      return qna.edges[0]?.node;
    }
  });

  isLoadingQna = computed(() => {
    return this.qnaResult()?.loading ?? true;
  });

  protected qnaId = computed(() => this.qnaData()?.id);
  state = computed(() => this.qnaData()?.state ?? QnaState.Stopped);
  autoPublish = computed(() => this.qnaData()?.autoPublish ?? true);
  threshold = computed(() => this.qnaData()?.threshold);
  tags = computed(() => this.qnaData()?.tags ?? []);
  activePost = computed(() => this.qnaData()?.activePost ?? undefined);

  protected postCountsRef?: QueryRef<
    QnaPostCountsByQnaIdQuery,
    Exact<QnaPostCountsByQnaIdQueryVariables>
  >;

  readonly postCountsResult = toSignal(
    toObservable(this.qnaId).pipe(
      switchMap((qnaId) => {
        if (!qnaId) {
          return of(null);
        }
        this.postCountsRef = this.postCounts.watch({ variables: { qnaId } });
        return this.postCountsRef.valueChanges.pipe(
          filter((r) => r.dataState === 'complete')
        );
      })
    )
  );

  readonly counts = computed(() => {
    return (
      this.postCountsResult()?.data?.qnaPostCountsByQnaId ?? {
        accepted: 0,
        rejected: 0,
      }
    );
  });

  protected postQueryRef?: QueryRef<QnaPostsByQnaIdQuery>;

  protected postsResult = toSignal(
    toObservable(this.queryVars).pipe(
      switchMap((query) => {
        if (!query.qnaId) {
          return of(null);
        }
        this.postQueryRef = this.postsByQna.watch({
          variables: {
            query,
          },
          fetchPolicy: 'cache-and-network',
        });
        return this.postQueryRef.valueChanges;
      })
    )
  );

  posts = computed(() => {
    const result = this.postsResult();
    const edges = result?.data?.qnaPostsByQnaId?.edges ?? [];
    return edges.map((e) => e?.node).filter((n): n is Post => !!n);
  });

  isLoadingPosts = computed(() => {
    return this.postsResult()?.networkStatus === NetworkStatus.loading;
  });
  isFetchMore = computed(() => {
    return this.postsResult()?.networkStatus === NetworkStatus.fetchMore;
  });
  QnaState = QnaState;

  // Route data input below
  viewRole = input.required<UserRole>();

  private debounceTimer?: ReturnType<typeof setTimeout>;
  readonly search: WritableSignal<string | undefined> = signal(undefined);
  readonly selectedTags: WritableSignal<Tag[] | undefined> = signal(undefined);
  readonly selectedFavoriteFilter: WritableSignal<boolean | undefined> =
    signal(undefined);
  readonly selectedCorrectFilter: WritableSignal<CorrectState | undefined> =
    signal(undefined);
  readonly selectedRepliedFilter: WritableSignal<boolean | undefined> =
    signal(undefined);
  readonly selectedPeriodFilter: WritableSignal<number | undefined> = signal(
    !this.globalStorageService.getItem(STORAGE_KEYS.COMMENT_TIME_FILTER)
      ? undefined
      : this.globalStorageService.getItem(STORAGE_KEYS.COMMENT_TIME_FILTER)
  );

  readonly selectedSortOrder: WritableSignal<PostSortOrder> = signal(
    PostSortOrder.Newest
  );

  currentSort = CommentSort.TIME;
  selectedFlags: CommentFilter[] = [];
  searchInput = '';

  scroll = false;
  scrollStart = APP_PADDING - BAR_PADDING;
  scrollExtended = false;
  isScrollStart = false;
  scrollExtendedMax = 500;
  lastScroll = 0;
  scrollActive = false;
  animatePost = false;

  newPostsAvailable = false;

  invalidate$ = new Subject<void>();

  constructor() {
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    const sort = this.globalStorageService.getItem(STORAGE_KEYS.COMMENT_SORT);
    if (sort) {
      this.sort(sort);
    }
    toObservable(this.qnaId).subscribe((qnaId) => {
      if (!qnaId) return;
      this.subscribeToEvents(qnaId);
    });
    this.invalidate$
      .pipe(auditTime(THROTTLE + Math.random() * 1000))
      .subscribe(() => {
        if (this.scrollExtended) {
          this.newPostsAvailable = true;
        } else {
          this.refetchPosts();
        }
      });
    effect(() => {
      const isLoading = this.isLoadingPosts();
      if (isLoading) {
        this.animatePost = false;
      } else {
        setTimeout(() => {
          this.animatePost = true;
        });
      }
    });
  }

  protected subscribeToEvents(qnaId: string) {
    this.postCreated
      .subscribe({ variables: { qnaId } })
      .pipe(takeUntilDestroyed(this.destroyed$))
      .subscribe(() => {
        this.invalidate$.next();
      });
    this.postDeleted
      .subscribe({ variables: { qnaId } })
      .pipe(takeUntilDestroyed(this.destroyed$))
      .subscribe((result) => {
        if (result.data) {
          this.removePostFromCache(result.data.qnaPostDeleted.id);
          this.updateCountAfterPostDeleted();
        }
      });
    this.postAccepted
      .subscribe({ variables: { qnaId } })
      .pipe(takeUntilDestroyed(this.destroyed$))
      .subscribe((result) => {
        this.updateCountAfterPostModerated(true);
        if (this.isModeration()) {
          if (result.data) {
            this.removePostFromCache(result.data.qnaPostAccepted.id);
          }
        } else {
          this.invalidate$.next();
        }
      });
    this.postRejected
      .subscribe({ variables: { qnaId } })
      .pipe(takeUntilDestroyed(this.destroyed$))
      .subscribe((result) => {
        this.updateCountAfterPostModerated(false);
        if (this.isModeration()) {
          this.invalidate$.next();
        } else if (result.data) {
          this.removePostFromCache(result.data.qnaPostRejected.id);
        }
      });
    this.postReplied
      .subscribe({ variables: { qnaId } })
      .pipe(takeUntilDestroyed(this.destroyed$))
      .subscribe();
    this.postMarkedFavorite.subscribe({ variables: { qnaId } }).subscribe();
    this.postMarkedCorrect
      .subscribe({ variables: { qnaId } })
      .pipe(takeUntilDestroyed(this.destroyed$))
      .subscribe();
    this.postVoted
      .subscribe({ variables: { qnaId } })
      .pipe(takeUntilDestroyed(this.destroyed$))
      .subscribe();
    this.qnaStateChanged
      .subscribe({ variables: { roomId: this.roomId() } })
      .pipe(takeUntilDestroyed(this.destroyed$))
      .subscribe();
    this.activePostUpdated
      .subscribe({ variables: { roomId: this.roomId() } })
      .pipe(takeUntilDestroyed(this.destroyed$))
      .subscribe();
  }

  protected refetchPosts() {
    this.postQueryRef?.refetch();
    this.postCountsRef?.refetch();
    this.newPostsAvailable = false;
  }

  protected removePostFromCache(postId: string) {
    this.apollo.client.cache.modify({
      fields: {
        qnaPostsByQnaId(existingConnection = {}, { readField }) {
          const edges = existingConnection.edges ?? [];
          const filteredList = edges.filter((edge: PostEdge) => {
            const nodeRef = edge.node;
            return readField('id', nodeRef) !== postId;
          });
          return {
            ...existingConnection,
            edges: filteredList,
          };
        },
      },
    });
  }

  private updateCountAfterPostModerated(accepted: boolean) {
    this.apollo.client.cache.writeQuery({
      query: QnaPostCountsByQnaIdDocument,
      variables: { qnaId: this.qnaId() },
      data: {
        qnaPostCountsByQnaId: {
          accepted: this.counts().accepted + (accepted ? 1 : -1),
          rejected: this.counts().rejected + (accepted ? -1 : 1),
        },
      },
    });
  }

  private updateCountAfterPostDeleted() {
    this.apollo.client.cache.writeQuery({
      query: QnaPostCountsByQnaIdDocument,
      variables: { qnaId: this.qnaId() },
      data: {
        qnaPostCountsByQnaId: {
          accepted: this.counts().accepted - (this.isModeration() ? 0 : 1),
          rejected: this.counts().rejected - (this.isModeration() ? 1 : 0),
        },
      },
    });
  }

  initializeScrollListener(): void {
    const scrollContainer = document.getElementById('routing-content');
    if (!scrollContainer) return;
    fromEvent(scrollContainer, 'scroll')
      .pipe(debounceTime(100))
      .subscribe(() => this.checkScroll(scrollContainer));
  }

  checkScroll(scrollElement: HTMLElement): void {
    const currentScroll = scrollElement.scrollTop;
    this.scroll = this.isScrollPosition(currentScroll);
    this.scrollActive = this.scroll && currentScroll < this.lastScroll;
    this.scrollExtended = currentScroll >= this.scrollExtendedMax;
    if (this.scrollActive && !this.scrollExtended) {
      this.refetchPosts();
    }
    this.isScrollStart = currentScroll >= this.scrollStart;
    this.showCommentsForScrollPosition(
      currentScroll,
      scrollElement.scrollHeight
    );
    this.lastScroll = currentScroll;
  }

  isScrollPosition(scrollPosition: number): boolean {
    return (
      scrollPosition > 0 ||
      (scrollPosition > 0 && scrollPosition < this.lastScroll)
    );
  }

  showCommentsForScrollPosition(scrollPosition: number, scrollHeight: number) {
    const pageInfo = this.postsResult()?.data?.qnaPostsByQnaId?.pageInfo;
    if (!pageInfo) return;
    if (
      window.innerHeight * 2 + scrollPosition >= scrollHeight &&
      scrollPosition > this.lastScroll &&
      pageInfo.hasNextPage &&
      !this.isFetchMore()
    ) {
      const cursor = pageInfo.endCursor;
      this.postQueryRef?.fetchMore({
        variables: { query: this.queryVars(), cursor: cursor },
      });
    }
  }

  scrollTop() {
    this.refetchPosts();
    document
      .getElementById('routing-content')
      ?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  searchComments(input?: string): void {
    clearTimeout(this.debounceTimer);
    if (input) {
      this.debounceTimer = setTimeout(() => {
        this.search.set(input);
      }, 300);
    } else {
      this.search.set(input);
    }
  }

  openCreateDialog(): void {
    this.dialog.open(CreateCommentComponent, {
      width: '400px',
      data: {
        tags: this.tags(),
        roomId: this.room().id,
        autoPublish: this.autoPublish,
        qnaId: this.qnaId(),
      },
    });
  }

  selectFlagFilter(type: CommentFilter) {
    switch (type) {
      case CommentFilter.FAVORITE:
        this.selectedFavoriteFilter.set(true);
        break;
      case CommentFilter.ANSWERED:
        this.selectedRepliedFilter.set(true);
        break;
      case CommentFilter.CORRECT:
        this.selectedFlags = this.selectedFlags.filter(
          (f) => f !== CommentFilter.WRONG
        );
        this.selectedCorrectFilter.set(CorrectState.Correct);
        break;
      case CommentFilter.WRONG:
        this.selectedFlags = this.selectedFlags.filter(
          (f) => f !== CommentFilter.CORRECT
        );

        this.selectedCorrectFilter.set(CorrectState.Wrong);
        break;
    }
    this.selectedFlags.push(type);
  }

  removeFlagFilter(type: CommentFilter) {
    switch (type) {
      case CommentFilter.FAVORITE:
        this.selectedFavoriteFilter.set(undefined);
        break;
      case CommentFilter.ANSWERED:
        this.selectedRepliedFilter.set(undefined);
        break;
      case CommentFilter.CORRECT:
        this.selectedCorrectFilter.set(CorrectState.Unset);
        break;
      case CommentFilter.WRONG:
        this.selectedCorrectFilter.set(CorrectState.Unset);
        break;
    }
    this.selectedFlags = this.selectedFlags.filter((f) => f !== type);
  }

  removeFilterTag(tagId: string) {
    const selectedTags = this.selectedTags();
    if (selectedTags && selectedTags.map((t) => t.id).includes(tagId)) {
      this.selectedTags.set(selectedTags.filter((t) => t.id !== tagId));
    }
  }

  selectFilterTag(tagId: string) {
    const selectedTags = this.selectedTags();
    const tag = this.tags().find((t) => t.id === tagId);
    if (tag) {
      if (selectedTags && selectedTags.some((t) => t.id === tagId)) {
        this.removeFilterTag(tagId);
      } else {
        this.selectedTags.set([tag]);
      }
    }
  }

  showReadonlyStateNotification() {
    const type =
      this.state() === QnaState.Paused
        ? AdvancedSnackBarTypes.WARNING
        : AdvancedSnackBarTypes.SUCCESS;
    const msg = this.translateService.translate(
      'comment-list.qna-' + this.state().toLowerCase()
    );
    this.notificationService.showAdvanced(msg, type);
  }

  sort(sort: CommentSort) {
    this.currentSort = sort;
    switch (sort) {
      case CommentSort.TIME:
        this.selectedSortOrder.set(PostSortOrder.Newest);
        break;
      case CommentSort.VOTEDESC:
        this.selectedSortOrder.set(PostSortOrder.HighestScore);
        break;
      case CommentSort.VOTEASC:
        this.selectedSortOrder.set(PostSortOrder.LowestScore);
        break;
    }
    this.globalStorageService.setItem(STORAGE_KEYS.COMMENT_SORT, sort);
  }

  setPeriod(period?: number) {
    this.selectedPeriodFilter.set(period);
    this.globalStorageService.setItem(STORAGE_KEYS.COMMENT_TIME_FILTER, period);
  }
}
