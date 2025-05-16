import { Component, Input, inject } from '@angular/core';
import { Comment } from '@app/core/models/comment';
import { CommentService } from '@app/core/services/http/comment.service';
import { TranslocoService } from '@jsverse/transloco';
import { Message } from '@stomp/stompjs';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { Room } from '@app/core/models/room';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { CommentSort } from '@app/core/models/comment-sort.enum';
import { CommentFilter } from '@app/core/models/comment-filter.enum';
import { CommentPeriod } from '@app/core/models/comment-period.enum';
import { CreateCommentComponent } from '@app/standalone/_dialogs/create-comment/create-comment.component';
import { CommentSettings } from '@app/core/models/comment-settings';

export const itemRenderNumber = 20;

export const BAR_PADDING = 16;
const APP_PADDING = 0.04;
@Component({
  template: '',
  standalone: false,
})
export class AbstractCommentsPageComponent {
  protected commentService = inject(CommentService);
  protected translateService = inject(TranslocoService);
  protected dialog = inject(MatDialog);
  protected wsCommentService = inject(WsCommentService);
  protected notificationService = inject(NotificationService);
  protected announceService = inject(AnnounceService);
  protected router = inject(Router);
  protected globalStorageService = inject(GlobalStorageService);
  protected commentSettingsService = inject(CommentSettingsService);
  protected authenticationService = inject(AuthenticationService);

  protected destroyed$ = new Subject<void>();

  protected publicComments$?: Observable<Comment[]>;
  protected activeComments$?: Observable<Comment[]>;

  // Route data input below
  @Input({ required: true }) viewRole!: UserRole;
  @Input({ required: true }) room!: Room;
  @Input({ required: true }) commentSettings!: CommentSettings;

  isLoading = true;
  comments: Comment[] = [];
  filteredComments: Comment[] = [];
  commentsFilteredByTime: Comment[] = [];
  displayComments: Comment[] = [];
  activeComment?: Comment;
  newestComment = new Comment();
  hideCommentsList = false;
  publicCounter = 0;
  userId?: string;

  currentSort: CommentSort;
  currentFilter?: CommentFilter;
  period: CommentPeriod;
  searchInput = '';
  currentTag?: string;

  scroll = false;
  scrollStart = innerWidth * APP_PADDING - BAR_PADDING;
  scrollExtended = false;
  isScrollStart = false;
  scrollExtendedMax = 500;
  lastScroll = 0;
  scrollActive = false;
  scrollToTop = false;

  disabled = false;
  readonly = false;
  directSend = false;
  fileUploadEnabled = false;
  thresholdEnabled = false;
  commentThreshold?: number;

  commentCounter = itemRenderNumber;
  freeze = false;
  readTimestamp = new Date();
  unreadCommentCount = 0;
  referenceEvent: Subject<string> = new Subject<string>();

  constructor() {
    const translateService = this.translateService;
    const globalStorageService = this.globalStorageService;

    const lastSort = globalStorageService.getItem(STORAGE_KEYS.COMMENT_SORT);
    this.currentSort = lastSort || CommentSort.TIME;
    this.period =
      globalStorageService.getItem(STORAGE_KEYS.COMMENT_TIME_FILTER) ||
      CommentPeriod.ALL;
    translateService.setActiveLang(
      globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
  }

  load(reload = false) {
    this.resetReadTimestamp();
    if (this.activeComments$) {
      this.activeComments$.subscribe((comments) => {
        this.comments = comments;
        this.initRoom(reload);
      });
    }
    if (!reload) {
      this.init();
    }
  }

  init(): void {
    this.authenticationService
      .getCurrentAuthentication()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((auth) => {
        this.userId = auth.userId;
      });
    const scrollContainer = document.getElementById('routing-content');
    scrollContainer?.addEventListener(
      'scroll',
      () => {
        this.checkScroll(scrollContainer);
      },
      true
    );
  }

  destroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  initRoom(reload = false) {
    if (!reload) {
      this.directSend = this.commentSettings.directSend;
      this.fileUploadEnabled = this.commentSettings.fileUploadEnabled;
      this.disabled = this.commentSettings.disabled;
      this.readonly = this.commentSettings.readonly;
    }
    this.getComments();
    if (reload && this.searchInput) {
      this.searchComments(this.searchInput);
    }
    if (!reload) {
      this.subscribeToStreams();
      this.afterCommentsLoadedHook();
    }
  }

  subscribeToStreams() {
    this.subscribeCommentStream();
  }

  checkScroll(scrollElement: HTMLElement): void {
    const currentScroll = scrollElement.scrollTop;
    this.scroll = this.isScrollPosition(currentScroll);
    this.scrollActive = this.scroll && currentScroll < this.lastScroll;
    this.scrollExtended = currentScroll >= this.scrollExtendedMax;
    this.checkFreeze();
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
    const length = this.hideCommentsList
      ? this.filteredComments.length
      : this.commentsFilteredByTime.length;
    if (this.displayComments.length !== length) {
      if (window.innerHeight * 2 + scrollPosition >= scrollHeight) {
        this.commentCounter += itemRenderNumber / 2;
        this.getDisplayComments();
      }
    }
  }

  checkFreeze() {
    if (this.scrollExtended && !this.freeze) {
      this.pauseCommentStream();
    }
    if (this.freeze && !this.scrollExtended && this.scrollActive) {
      this.playCommentStream();
    }
  }

  reduceCommentCounter() {
    if (this.commentCounter > 20) {
      this.commentCounter--;
    }
  }

  scrollTop(smooth?: boolean) {
    const behavior =
      this.displayComments.length <= itemRenderNumber || smooth
        ? 'smooth'
        : 'auto';
    document
      .getElementById('routing-content')
      ?.scrollTo({ top: 0, behavior: behavior });
  }

  searchComments(input?: string): void {
    if (!input && this.searchInput) {
      this.hideCommentsList = false;
      this.searchInput = '';
    } else if (input) {
      this.currentFilter = undefined;
      this.currentTag = undefined;
      this.hideCommentsList = true;
      this.searchInput = input;
      this.filteredComments = this.commentsFilteredByTime.filter(
        (c) =>
          this.searchInput &&
          c.body.toLowerCase().includes(this.searchInput.toLowerCase())
      );
    }
    this.getDisplayComments();
  }

  getThresholdSettings() {
    if (this.room?.extensions?.comments) {
      this.thresholdEnabled = !!this.room.extensions.comments.enableThreshold;
    }
    const threshold = this.room.extensions?.comments?.commentThreshold;
    if (this.thresholdEnabled && threshold) {
      this.commentThreshold = threshold;
    }
  }

  getCommentsWithThreshold() {
    if (!this.thresholdEnabled) {
      return;
    }
    if (this.hideCommentsList) {
      this.filteredComments = this.filteredComments.filter(
        (x) => this.commentThreshold && x.score >= this.commentThreshold
      );
    } else {
      this.comments = this.comments.filter(
        (x) => this.commentThreshold && x.score >= this.commentThreshold
      );
    }
  }

  getComments(): void {
    this.getThresholdSettings();
    this.getCommentsWithThreshold();
    this.setTimePeriod(this.period);
    this.isLoading = false;
  }

  afterCommentsLoadedHook() {
    // Implemented by extended class
  }

  getDisplayComments() {
    const commentList = this.hideCommentsList
      ? this.filteredComments
      : this.commentsFilteredByTime;
    this.displayComments = commentList.slice(
      0,
      Math.min(this.commentCounter, this.commentsFilteredByTime.length)
    );
  }

  getUnreadCommentCount() {
    this.unreadCommentCount = this.comments.filter(
      (c) => new Date(c.timestamp) > this.readTimestamp
    ).length;
  }

  loadAndScroll() {
    this.scrollTop(true);
  }

  resetReadTimestamp() {
    this.readTimestamp = new Date();
    this.unreadCommentCount = 0;
  }

  addNewComment(comment: Comment) {
    const c = new Comment();
    c.roomId = this.room.id;
    c.body = comment.body;
    c.id = comment.id;
    c.timestamp = comment.timestamp;
    c.tag = comment.tag;
    c.answer = comment.answer;
    c.favorite = comment.favorite;
    c.correct = comment.correct;
    c.ack = this.directSend;
    this.announceNewComment(c);
    this.comments = this.comments.concat(c);
    this.commentCounter++;
    if (this.scrollExtended) {
      this.getUnreadCommentCount();
    } else {
      this.resetReadTimestamp();
    }
  }

  parseIncomingMessage(message: Message) {
    let updateList = false;
    let highlightEvent = false;
    const msg = JSON.parse(message.body);
    const payload = msg.payload;
    const commentIndex = this.comments.map((c) => c.id).indexOf(payload.id);
    switch (msg.type) {
      case 'CommentCreated':
        this.addNewComment(payload);

        this.publicCounter++;
        break;
      case 'CommentPatched':
        updateList = this.handleCommentPatch(
          payload.changes,
          payload.id,
          commentIndex
        );
        break;
      case 'CommentHighlighted':
        highlightEvent = true;
        if (commentIndex > -1) {
          this.comments[commentIndex].highlighted = <boolean>payload.lights;
        }
        break;
      case 'CommentDeleted':
        updateList = true;
        this.handleCommentDelete(payload.id);
        break;
      default:
        this.referenceEvent.next(payload.id);
    }
    if (!highlightEvent && (!this.freeze || updateList)) {
      this.afterIncomingMessage();
    }
  }

  handleCommentPatch(changes: object, id: string, index: number): boolean {
    for (const [key, value] of Object.entries(changes)) {
      if (key === 'ack') {
        this.handleCommentPatchAck(id, value);
        return true;
      } else {
        if (index > -1) {
          switch (key) {
            case 'answer':
              this.comments[index].answer = value;
              break;
            case 'correct':
              this.comments[index].correct = value;
              break;
            case 'favorite':
              this.comments[index].favorite = value;
              break;
            case 'score':
              this.comments[index].score = value;
          }
        }
      }
    }
    return false;
  }

  handleCommentPatchAck(id: string, value: boolean) {
    if (!value) {
      this.removeCommentFromList(id);
      this.reduceCommentCounter();
    }
  }

  removeCommentFromList(id: string) {
    this.comments = this.comments.filter(function (el) {
      return el.id !== id;
    });
  }

  handleCommentDelete(id: string) {
    this.removeCommentFromList(id);
    this.publicCounter--;
    this.reduceCommentCounter();
    this.checkIfActiveComment(id);
  }

  afterIncomingMessage() {
    this.setTimePeriod(this.period);
    if (this.hideCommentsList) {
      this.searchComments(this.searchInput);
    }
  }

  checkIfActiveComment(id: string) {
    if (id === this.activeComment?.id) {
      this.activeComment = undefined;
    }
  }

  openCreateDialog(): void {
    let tags;
    if (this.room.extensions?.comments?.tags) {
      tags = this.room.extensions.comments.tags;
    }
    this.dialog.open(CreateCommentComponent, {
      width: '400px',
      data: {
        userId: this.userId,
        tags: tags,
        roomId: this.room.id,
        directSend: this.directSend,
        fileUploadEnabled: this.fileUploadEnabled,
        role: this.viewRole,
      },
    });
  }

  filterComments(type?: CommentFilter, tag = this.currentTag): void {
    if (this.currentFilter && !type) {
      this.hideCommentsList = false;
    } else if (type) {
      this.searchInput = '';
      this.filteredComments = this.commentService.filterComments(
        this.commentsFilteredByTime,
        type,
        tag
      );
      this.hideCommentsList = true;
      if (tag) {
        this.currentTag = tag;
      }
    }
    if (type !== CommentFilter.TAG) {
      this.currentTag = undefined;
    }
    this.currentFilter = type;
    this.sortComments();
  }

  sortCommentsManually(type: CommentSort) {
    this.scrollToTop = true;
    this.sortComments(type);
  }

  sortComments(type = this.currentSort): void {
    if (this.hideCommentsList === true) {
      this.filteredComments = this.commentService.sortComments(
        this.filteredComments,
        type
      );
    } else {
      this.commentsFilteredByTime = this.commentService.sortComments(
        this.commentsFilteredByTime,
        type
      );
    }
    this.currentSort = type;
    this.globalStorageService.setItem(
      STORAGE_KEYS.COMMENT_SORT,
      this.currentSort
    );
    if (this.scrollToTop) {
      this.commentCounter = itemRenderNumber;
      this.scrollTop();
      this.scrollToTop = false;
    }
    this.getDisplayComments();
  }

  selectTag(tag?: string): void {
    if (tag === this.currentTag) {
      return;
    }
    if (tag) {
      this.filterComments(CommentFilter.TAG, tag);
    } else {
      this.filterComments();
    }
  }

  pauseCommentStream() {
    this.freeze = true;
  }

  playCommentStream() {
    this.freeze = false;
    this.resetReadTimestamp();
    this.getComments();
  }

  showReadonlyStateNotification() {
    const state = this.readonly ? 'not-allowed' : 'allowed';
    const type = this.readonly
      ? AdvancedSnackBarTypes.WARNING
      : AdvancedSnackBarTypes.SUCCESS;
    const msg = this.translateService.translate(
      'comment-list.creation-' + state
    );
    this.notificationService.showAdvanced(msg, type);
  }

  subscribeCommentStream() {
    this.wsCommentService
      .getCommentStream(this.room.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((message: Message) => {
        this.parseIncomingMessage(message);
      });
  }

  announceNewComment(comment: Comment) {
    this.newestComment = comment;
    const msg = this.translateService.translate('comment-page.new-comment', {
      comment: comment.body,
    });
    this.announceService.announce(msg);
  }

  setTimePeriod(period: CommentPeriod) {
    this.period = period;
    this.commentsFilteredByTime =
      this.commentService.filterCommentsByTimePeriod(
        this.comments,
        this.period
      );
    this.filterComments(this.currentFilter);
    this.globalStorageService.setItem(
      STORAGE_KEYS.COMMENT_TIME_FILTER,
      this.period
    );
  }
}
