import { Component } from '@angular/core';
import { Comment } from '@app/core/models/comment';
import { CommentService } from '@app/core/services/http/comment.service';
import { TranslateService } from '@ngx-translate/core';
import { Message } from '@stomp/stompjs';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { Room } from '@app/core/models/room';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { CommentSettings } from '@app/core/models/comment-settings';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { CommentSort } from '@app/core/models/comment-sort.enum';
import { CommentFilter } from '@app/core/models/comment-filter.enum';
import { CommentPeriod } from '@app/core/models/comment-period.enum';
import { CreateCommentComponent } from '@app/standalone/_dialogs/create-comment/create-comment.component';

export const itemRenderNumber = 20;

@Component({ template: '' })
export class AbstractCommentsPageComponent {
  protected destroyed$ = new Subject<void>();

  protected publicComments$: Observable<Comment[]>;
  protected activeComments$: Observable<Comment[]>;

  isLoading = true;

  comments: Comment[] = [];
  filteredComments: Comment[];
  commentsFilteredByTime: Comment[] = [];
  displayComments: Comment[] = [];
  activeComment: Comment;
  newestComment = new Comment();
  hideCommentsList = false;
  publicCounter = 0;

  viewRole: UserRole;
  userId: string;
  roomId: string;
  room: Room;

  currentSort: CommentSort;
  currentFilter = CommentFilter.NONE;
  period: CommentPeriod;
  searchInput: string;

  scroll = false;
  scrollMax = 0;
  scrollStart: number;
  scrollExtended = false;
  isScrollStart = false;
  scrollExtendedMax = 500;
  lastScroll = 0;
  scrollActive = false;
  scrollToTop = false;

  disabled: boolean;
  readonly: boolean;
  directSend: boolean;
  fileUploadEnabled: boolean;
  thresholdEnabled: boolean;
  commentThreshold: number;

  commentCounter = itemRenderNumber;
  freeze = false;
  readTimestamp: Date;
  unreadCommentCount: number;
  navBarExists = true;
  referenceEvent: Subject<string> = new Subject<string>();

  constructor(
    protected commentService: CommentService,
    protected translateService: TranslateService,
    protected dialog: MatDialog,
    protected wsCommentService: WsCommentService,
    protected notificationService: NotificationService,
    protected announceService: AnnounceService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected globalStorageService: GlobalStorageService,
    protected commentSettingsService: CommentSettingsService,
    protected authenticationService: AuthenticationService
  ) {}

  init(reload = false) {
    this.resetReadTimestamp();
    const lastSort = this.globalStorageService.getItem(
      STORAGE_KEYS.COMMENT_SORT
    );
    this.currentSort = lastSort || CommentSort.TIME;
    this.period =
      this.globalStorageService.getItem(STORAGE_KEYS.COMMENT_TIME_FILTER) ||
      CommentPeriod.ALL;
    this.translateService.use(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.activeComments$.subscribe((comments) => {
      this.comments = comments;
      this.initRoom(reload);
    });
    this.authenticationService
      .getCurrentAuthentication()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((auth) => {
        this.userId = auth.userId;
      });
    document.getElementById('routing-content')?.addEventListener(
      'scroll',
      () => {
        this.checkScroll();
      },
      true
    );
  }

  initPublicCounter() {
    this.commentService
      .countByRoomId(this.room.id, true)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((commentCounter) => {
        this.publicCounter = commentCounter;
      });
  }

  destroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  initRoom(reload = false) {
    if (!reload) {
      const commentSettings = this.route.snapshot.data.commentSettings;
      this.directSend = commentSettings.directSend;
      this.fileUploadEnabled = commentSettings.fileUploadEnabled;
      this.disabled = commentSettings.disabled;
      this.readonly = commentSettings.readonly;
    }
    this.getComments();
    if (reload && this.searchInput) {
      this.searchComments();
    }
    if (!reload) {
      this.subscribeToStreams();
    }
  }

  subscribeToStreams() {
    this.subscribeCommentStream();
  }

  checkScroll(scrollPosition?: number, scrollHeight?: number): void {
    const currentScroll =
      scrollPosition || document.getElementById('routing-content').scrollTop;
    this.scroll = this.isScrollPosition(currentScroll);
    this.scrollActive = this.scroll && currentScroll < this.lastScroll;
    this.scrollExtended = currentScroll >= this.scrollExtendedMax;
    this.checkFreeze();
    this.isScrollStart =
      currentScroll >= this.scrollStart &&
      currentScroll <= this.scrollStart + 200;
    this.showCommentsForScrollPosition(currentScroll, scrollHeight);
    this.lastScroll = currentScroll;
  }

  isScrollPosition(scrollPosition: number): boolean {
    const additionalSpace = innerWidth < 1001 ? 56 + innerWidth * 0.04 : 0;
    return (
      scrollPosition > this.scrollMax + additionalSpace ||
      (scrollPosition > this.scrollMax && scrollPosition < this.lastScroll)
    );
  }

  showCommentsForScrollPosition(scrollPosition: number, scrollHeight: number) {
    const length = this.hideCommentsList
      ? this.filteredComments.length
      : this.commentsFilteredByTime.length;
    if (this.displayComments.length !== length) {
      const height = scrollHeight || document.body.scrollHeight;
      if (window.innerHeight * 2 + scrollPosition >= height) {
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
      .scrollTo({ top: 0, behavior: behavior });
  }

  searchComments(input?: string): void {
    if (input !== undefined) {
      this.searchInput = input;
    }
    if (this.searchInput) {
      if (this.searchInput.length > 0) {
        this.hideCommentsList = true;
        this.filteredComments = this.commentsFilteredByTime.filter((c) =>
          c.body.toLowerCase().includes(this.searchInput.toLowerCase())
        );
        this.getDisplayComments();
      }
    } else if (this.currentFilter === '') {
      this.hideCommentsList = false;
      this.getDisplayComments();
    }
  }

  getThresholdSettings() {
    if (this.room?.extensions?.comments) {
      this.thresholdEnabled =
        !!this.room.extensions.comments['enableThreshold'];
    }
    if (this.thresholdEnabled) {
      this.commentThreshold = this.room.extensions.comments['commentThreshold'];
    }
  }

  getCommentsWithThreshold() {
    if (!this.thresholdEnabled) {
      return;
    }
    if (this.hideCommentsList) {
      this.filteredComments = this.filteredComments.filter(
        (x) => x.score >= this.commentThreshold
      );
    } else {
      this.comments = this.comments.filter(
        (x) => x.score >= this.commentThreshold
      );
    }
  }

  getComments(): void {
    this.getThresholdSettings();
    this.getCommentsWithThreshold();
    this.setTimePeriod(this.period);
    this.isLoading = false;
    this.afterCommentsLoadedHook();
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
      (c) => c.timestamp > this.readTimestamp
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
    c.roomId = this.roomId;
    c.body = comment.body;
    c.id = comment.id;
    c.timestamp = comment.timestamp;
    c.tag = comment.tag;
    c.answer = comment.answer;
    c.favorite = comment.favorite;
    c.correct = comment.correct;
    this.announceNewComment(c);
    this.comments = this.comments.concat(c);
    this.commentCounter++;
    if (this.scrollExtended) {
      this.getUnreadCommentCount();
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

  handleSettings(settings: CommentSettings) {
    if (settings.disabled !== this.disabled) {
      this.disabled = settings.disabled;
    }
    if (settings.readonly !== this.readonly) {
      this.readonly = settings.readonly;
      this.showReadonlyStateNotification();
    }
  }

  handleCommentPatch(changes: object, id: string, index: number): boolean {
    for (const [key, value] of Object.entries(changes)) {
      if (key === CommentFilter.ACK) {
        this.handleCommentPatchAck(id, value);
        return true;
      } else {
        if (index > -1) {
          this.comments[index][key] = value;
        }
        return false;
      }
    }
  }

  handleCommentPatchAck(id: string, value: boolean) {
    // Implemented by extended class
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
      this.searchComments();
    }
  }

  checkIfActiveComment(id: string) {
    if (id === this.activeComment?.id) {
      this.activeComment = null;
    }
  }

  openCreateDialog(): void {
    let tags;
    if (this.room.extensions?.tags && this.room.extensions.tags['tags']) {
      tags = this.room.extensions.tags['tags'];
    }
    this.dialog.open(CreateCommentComponent, {
      width: '400px',
      data: {
        userId: this.userId,
        tags: tags,
        roomId: this.roomId,
        directSend: this.directSend,
        fileUploadEnabled: this.fileUploadEnabled,
        role: this.viewRole,
      },
    });
  }

  filterComments(type: CommentFilter, tag?: string): void {
    if (
      type === CommentFilter.NONE ||
      (this.currentFilter === CommentFilter.TAG && type === CommentFilter.TAG)
    ) {
      this.filteredComments = this.commentsFilteredByTime;
      this.hideCommentsList = false;
      this.currentFilter = CommentFilter.NONE;
      this.sortComments();
      return;
    }
    this.filteredComments = this.commentService.filterComments(
      this.commentsFilteredByTime,
      type,
      tag
    );
    this.currentFilter = type;
    this.hideCommentsList = true;
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

  clickedOnTag(tag: string): void {
    this.filterComments(CommentFilter.TAG, tag);
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
    const msg = this.translateService.instant('comment-list.creation-' + state);
    this.notificationService.showAdvanced(msg, type);
  }

  subscribeCommentStream() {
    this.wsCommentService
      .getCommentStream(this.roomId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((message: Message) => {
        this.parseIncomingMessage(message);
      });
  }

  announceNewComment(comment: Comment) {
    this.newestComment = comment;
    const msg = this.translateService.instant('comment-page.new-comment', {
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
