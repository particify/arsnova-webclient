import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Comment } from '../../../models/comment';
import { CommentService } from '../../../services/http/comment.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { Message } from '@stomp/stompjs';
import { WsCommentService } from '../../../services/websockets/ws-comment.service';
import { ClientAuthentication } from '../../../models/client-authentication';
import { Vote } from '../../../models/vote';
import { UserRole } from '../../../models/user-roles.enum';
import { Room } from '../../../models/room';
import { VoteService } from '../../../services/http/vote.service';
import { AdvancedSnackBarTypes, NotificationService } from '../../../services/util/notification.service';
import { CorrectWrong } from '../../../models/correct-wrong.enum';
import { EventService } from '../../../services/util/event.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from '../../../services/util/dialog.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { AnnounceService } from '../../../services/util/announce.service';
import { CommentSettingsService } from '../../../services/http/comment-settings.service';
import { Location } from '@angular/common';
import { HotkeyService } from '../../../services/util/hotkey.service';
import { RemoteMessage } from '../../../models/events/remote/remote-message.enum';
import { CommentFocusState } from '../../../models/events/remote/comment-focus-state';
import { RoutingService } from '../../../services/util/routing.service';
import { UiState } from '../../../models/events/ui/ui-state.enum';

// Using lowercase letters in enums because they we're also used for parsing incoming WS-messages

export enum Sort {
  VOTEASC = 'voteasc',
  VOTEDESC = 'votedesc',
  TIME = 'time'
}

enum Filter {
  FAVORITE = 'favorite',
  CORRECT = 'correct',
  WRONG = 'wrong',
  ACK = 'ack',
  TAG = 'tag',
  ANSWER = 'answer'
}

enum Period {
  ONEHOUR = 'time-1h',
  THREEHOURS = 'time-3h',
  ONEDAY = 'time-1d',
  ONEWEEK = 'time-1w',
  ALL = 'time-all'
}

export const itemRenderNumber = 20;

export class CommentPresentationState {
  stepState: string;
  commentId: string;

  constructor(step: string, commentId: string) {
    this.stepState = step;
    this.commentId = commentId;
  }
}

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss']
})
export class CommentListComponent implements OnInit, OnDestroy {
  @ViewChild('searchBox') searchField: ElementRef;
  @Input() auth: ClientAuthentication;
  @Input() isModerator = false;
  @Input() isArchive = false;
  @Input() isPresentation = false;
  @Input() activeComment: Comment;
  @Input() archivedComments$: Observable<Comment[]>;
  @Output() updateActiveComment = new EventEmitter<Comment>();

  publicComments$: Observable<Comment[]>;
  moderationComments$: Observable<Comment[]>;
  activeComments$: Observable<Comment[]>;
  comments: Comment[] = [];
  roomId: string;
  viewRole: UserRole;
  room: Room;
  hideCommentsList = false;
  filteredComments: Comment[];
  deviceType: string;
  deviceWidth = innerWidth;
  isLoading = true;
  currentSort: string;
  sorting = Sort;
  currentFilter: string;
  filtering = Filter;
  commentVoteMap = new Map<string, Vote>();
  scroll = false;
  scrollMax = 0;
  scrollStart: number;
  scrollExtended = false;
  isScrollStart = false;
  scrollExtendedMax = 500;
  searchInput = '';
  search = false;
  searchPlaceholder = '';
  directSend = true;
  fileUploadEnabled = true;
  thresholdEnabled = false;
  newestComment: Comment = new Comment();
  freeze = false;
  commentStream: Subscription;
  moderatorStream: Subscription;
  commentsFilteredByTime: Comment[] = [];
  displayComments: Comment[] = [];
  commentCounter = itemRenderNumber;
  referenceEvent: Subject<string> = new Subject<string>();
  periodsList = Object.values(Period);
  period: Period;
  scrollToTop = false;
  navBarExists = false;
  lastScroll = 0;
  scrollActive = false;
  publicCounter = 0;
  moderationCounter = 0;
  onInit = false;

  navBarStateSubscription: Subscription;

  private hotkeyRefs: symbol[] = [];

  constructor(
    private commentService: CommentService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    protected langService: LanguageService,
    private wsCommentService: WsCommentService,
    protected voteService: VoteService,
    private notificationService: NotificationService,
    public eventService: EventService,
    public announceService: AnnounceService,
    private router: Router,
    protected route: ActivatedRoute,
    private globalStorageService: GlobalStorageService,
    private commentSettingsService: CommentSettingsService,
    private location: Location,
    private hotkeyService: HotkeyService,
    private routingService: RoutingService
  ) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.navBarStateSubscription = this.eventService.on<boolean>(UiState.NAV_BAR_VISIBLE).subscribe(isVisible => {
      this.navBarExists = isVisible;
    });
    this.onInit = true;
    const userId = this.auth?.userId;
    const lastSort = this.globalStorageService.getItem(STORAGE_KEYS.COMMENT_SORT);
    this.currentSort = this.isPresentation ? (lastSort && lastSort !== this.sorting.VOTEASC ? lastSort : this.sorting.TIME)
      : lastSort || this.sorting.VOTEDESC;
    this.period = this.globalStorageService.getItem(STORAGE_KEYS.COMMENT_TIME_FILTER) || Period.ALL;
    this.currentFilter = '';
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    this.route.data.subscribe(data => {
      this.room = data.room;
      this.roomId = this.room.id;
      if (this.isArchive) {
        this.activeComments$ = this.archivedComments$;
      } else {
        this.publicComments$ = this.commentService.getAckComments(this.room.id);
        this.moderationComments$ = this.commentService.getRejectedComments(this.room.id);
        this.activeComments$ = this.isModerator ? this.moderationComments$ : this.publicComments$;
      }
      this.initCounter();
      this.init();
      this.viewRole = data.viewRole;
      if (this.viewRole === UserRole.PARTICIPANT) {
        this.voteService.getByRoomIdAndUserID(this.roomId, userId).subscribe(votes => {
          for (const v of votes) {
            this.commentVoteMap.set(v.commentId, v);
          }
        });
      }
    });
    this.translateService.get('comment-list.search').subscribe(msg => {
      this.searchPlaceholder = msg;
    });
    this.deviceType = innerWidth > 1000 ? 'desktop' : 'mobile';
    if (this.viewRole !== UserRole.PARTICIPANT && innerWidth > 1000) {
      this.scrollMax += innerWidth * 0.04 + 240;
      this.scrollStart = this.scrollMax;
    }
    if (this.isPresentation) {
      this.translateService.get(['comment-list.next', 'comment-list.previous']).subscribe(t => {
        this.hotkeyService.registerHotkey({
          key: 'ArrowRight',
          action: () => this.nextComment(),
          actionTitle: t['comment-list.next']
        }, this.hotkeyRefs);
        this.hotkeyService.registerHotkey({
          key: 'ArrowLeft',
          action: () => this.prevComment(),
          actionTitle: t['comment-list.previous']
        }, this.hotkeyRefs);
      });
    }
    document.getElementById('routing-content')?.addEventListener('scroll', () => {
        this.checkScroll();
    }, true);
  }

  initCounter() {
    this.commentService.countByRoomId(this.room.id, true).subscribe(commentCounter => {
      this.publicCounter = commentCounter;
    });
    this.commentService.countByRoomId(this.room.id, false).subscribe(commentCounter => {
      this.moderationCounter = commentCounter;
    });
  }

  init(reload = false) {
    this.activeComments$.subscribe(comments => {
      this.comments = comments;
      this.initRoom(reload);
      if (this.isPresentation && this.comments.length === 0) {
        this.sendCommentStateChange('NO_COMMENTS_YET');
      }
    });
  }

  ngOnDestroy() {
    if (!this.freeze && this.commentStream) {
      this.commentStream.unsubscribe();
    }
    if (this.moderatorStream) {
      this.moderatorStream.unsubscribe();
    }
    if (this.navBarStateSubscription) {
      this.navBarStateSubscription.unsubscribe();
    }
    this.hotkeyRefs.forEach(h => this.hotkeyService.unregisterHotkey(h));
  }

  initRoom(reload = false) {
    this.commentSettingsService.get(this.roomId).subscribe(commentSettings => {
      this.directSend = commentSettings.directSend;
      this.fileUploadEnabled = commentSettings.fileUploadEnabled;
    });
    this.getComments();
    if (reload && this.search) {
      this.searchComments();
    }
    if (!this.isArchive && !reload) {
      this.subscribeCommentStream();
      if (this.viewRole !== UserRole.PARTICIPANT) {
        this.subscribeModeratorStream();
      }
    }
  }

  checkScroll(scrollPosition?: number, scrollHeight?: number): void {
    const currentScroll = scrollPosition || document.getElementById('routing-content').scrollTop;
    this.scroll = this.isScrollPosition(currentScroll);
    this.scrollActive = this.scroll && currentScroll < this.lastScroll;
    this.scrollExtended = currentScroll >= this.scrollExtendedMax;
    this.isScrollStart = currentScroll >= this.scrollStart && currentScroll <= (this.scrollStart + 200);
    this.showCommentsForScrollPosition(currentScroll, scrollHeight);
    this.lastScroll = currentScroll;
  }

  isScrollPosition(scrollPosition: number): boolean {
    const additionalSpace = this.deviceType === 'mobile' ? 70 + innerWidth * 0.04 : 0;
    return scrollPosition > (this.scrollMax + additionalSpace) || scrollPosition > this.scrollMax && scrollPosition < this.lastScroll;
  }

  showCommentsForScrollPosition(scrollPosition: number, scrollHeight: number) {
    const length = this.hideCommentsList ? this.filteredComments.length : this.commentsFilteredByTime.length;
    if (this.displayComments.length !== length) {
      const height = scrollHeight || document.body.scrollHeight;
      if (((window.innerHeight * 2) + scrollPosition) >= height) {
        this.commentCounter += itemRenderNumber / 2;
        this.getDisplayComments();
      }
    }
  }

  reduceCommentCounter() {
    if (this.commentCounter > 20) {
      this.commentCounter--;
    }
  }

  scrollTop(smooth?: boolean) {
    const behavior = this.displayComments.length <= itemRenderNumber || smooth ? 'smooth' : 'auto';
    document.getElementById('routing-content').scrollTo({top: 0, behavior: behavior});
  }

  searchComments(): void {
    if (this.searchInput) {
      if (this.searchInput.length > 0) {
        this.hideCommentsList = true;
        this.filteredComments = this.commentsFilteredByTime
          .filter(c => c.body.toLowerCase().includes(this.searchInput.toLowerCase()));
        this.getDisplayComments();
      }
    } else if (this.searchInput.length === 0 && this.currentFilter === '') {
      this.hideCommentsList = false;
      this.getDisplayComments();
    }
  }

  activateSearch() {
    this.translateService.get('comment-list.search').subscribe(msg => {
      this.searchPlaceholder = msg;
    });
    this.search = true;
    this.searchField.nativeElement.focus();
  }

  resetSearch() {
    this.hideCommentsList = false;
    this.searchInput = '';
    this.searchPlaceholder = '';
    this.search = false;
    this.getDisplayComments();
  }

  getComments(scrollToTop?: boolean): void {
    this.scrollToTop = scrollToTop;
    if (this.room && this.room.extensions && this.room.extensions.comments) {
      if (this.room.extensions.comments['enableThreshold']) {
        this.thresholdEnabled = true;
      } else {
        this.thresholdEnabled = false;
      }
    }
    let commentThreshold;
    if (this.thresholdEnabled) {
      commentThreshold = this.room.extensions.comments['commentThreshold'];
      if (this.hideCommentsList) {
        this.filteredComments = this.filteredComments.filter(x => x.score >= commentThreshold);
      } else {
        this.comments = this.comments.filter(x => x.score >= commentThreshold);
      }
    }
    this.setTimePeriod(this.period);
    if (this.isLoading) {
      this.initSubscriptions();
    }
    this.isLoading = false;
  }

  initSubscriptions() {
    if (this.isPresentation) {
      if (this.displayComments.length > 0) {
        this.goToFirstComment();
      }
      this.eventService.on<string>('CommentSortingChanged').subscribe(sort => {
        this.sortComments(sort);
        setTimeout(() => {
          this.goToFirstComment();
        }, 300);
      });
    }
    let comment;
    this.eventService.on<string>(RemoteMessage.COMMENT_ID_CHANGED).subscribe(commentId => {
      if (this.activeComment?.id !== commentId && comment?.id !== commentId) {
        comment = this.displayComments.find(c => c.id === commentId);
        let timeout = 0;
        if (!comment) {
          timeout = 500;
          this.commentCounter = this.hideCommentsList ? this.filteredComments.length : this.commentsFilteredByTime.length;
          this.getDisplayComments();
          comment = this.displayComments.find(c => c.id === commentId);
        }
        if (comment) {
          comment.highlighted = true;
          if (this.viewRole === UserRole.CREATOR) {
            setTimeout(() => {
              this.updateCurrentComment(comment, true);
            }, timeout);
          }
        }
      }
    });
  }

  goToFirstComment() {
    this.updateCurrentComment(this.displayComments[0]);
  }

  getDisplayComments() {
    const commentList = this.hideCommentsList ? this.filteredComments : this.commentsFilteredByTime;
    this.displayComments = commentList.slice(0, Math.min(this.commentCounter, this.commentsFilteredByTime.length));
  }

  getVote(comment: Comment): Vote {
    if (this.viewRole === UserRole.PARTICIPANT) {
      return this.commentVoteMap.get(comment.id);
    }
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
  }

  parseIncomingMessage(message: Message) {
    let updateList = false;
    let highlightEvent = false;
    const msg = JSON.parse(message.body);
    const payload = msg.payload;
    const commentIndex = this.comments.map(c => c.id).indexOf(payload.id);
    switch (msg.type) {
      case 'CommentCreated':
        if (!this.isModerator) {
          this.addNewComment(payload);
        }
        this.publicCounter++;
        break;
      case 'CommentPatched':
        updateList = this.handleCommentPatch(payload.changes, payload.id, commentIndex);
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
      if (key === Filter.ACK) {
        const isNowAck = this.isModerator ? !value : <boolean>value;
        if (!isNowAck) {
          this.removeCommentFromList(id)
          this.reduceCommentCounter();
          this.checkIfActiveComment(id);
          if (this.isModerator) {
            this.moderationCounter--;
          } else {
            this.publicCounter--;
          }
        } else {
          if (!this.isModerator) {
            this.moderationCounter--;
          }
        }
        return true;
      } else {
        if (index > -1) {
          this.comments[index][key] = value;
        }
        return false;
      }
    }
  }

  removeCommentFromList(id: string) {
    this.comments = this.comments.filter(function (el) {
      return el.id !== id;
    });
  }

  handleCommentDelete(id: string) {
    this.removeCommentFromList(id);
    if (this.isModerator) {
      this.moderationCounter--
    } else {
      this.publicCounter--;
    }
    this.reduceCommentCounter();
    this.checkIfActiveComment(id);
  }

  parseIncomingModeratorMessage(message: Message) {
    const msg = JSON.parse(message.body);
    const payload = msg.payload;
    if (msg.type === 'CommentCreated') {
      if (this.isModerator) {
        this.addNewComment(payload);
      }
      this.moderationCounter++;
    }
    this.afterIncomingMessage();
  }

  afterIncomingMessage() {
    this.setTimePeriod(this.period);
    if (this.hideCommentsList) {
      this.searchComments();
    }
    if (this.isPresentation && this.activeComment) {
      this.scrollToComment(this.getCurrentIndex());
    }
  }

  checkIfActiveComment(id: string) {
    if (id === this.activeComment?.id) {
      this.updateActiveComment.emit(null);
      this.activeComment = null;
    }
  }

  openCreateDialog(): void {
    let tags;
    if (this.room.extensions && this.room.extensions.tags && this.room.extensions.tags['tags']) {
      tags = this.room.extensions.tags['tags'];
    }
    this.dialogService.openCreateCommentDialog(this.auth, tags, this.roomId, this.directSend, this.fileUploadEnabled, this.viewRole);
  }

  filterComments(type: string, tag?: string): void {
    if (type === '' || (this.currentFilter === this.filtering.TAG && type === this.filtering.TAG)) {
      this.filteredComments = this.commentsFilteredByTime;
      this.hideCommentsList = false;
      this.currentFilter = '';
      this.sortComments(this.currentSort);
      return;
    }
    this.filteredComments = this.commentsFilteredByTime.filter(c => {
      switch (type) {
        case this.filtering.CORRECT:
          return c.correct === CorrectWrong.CORRECT ? 1 : 0;
        case this.filtering.WRONG:
          return c.correct === CorrectWrong.WRONG ? 1 : 0;
        case this.filtering.FAVORITE:
          return c.favorite;
        case this.filtering.TAG:
          return c.tag === tag;
        case this.filtering.ANSWER:
          return c.answer;
      }
    });
    this.currentFilter = type;
    this.hideCommentsList = true;
    this.sortComments(this.currentSort);
  }

  sort(array: any[], type: string): any[] {
    return array.sort((a, b) => {
      if (type === this.sorting.VOTEASC) {
        return (a.score > b.score) ? 1 : (b.score > a.score) ? -1 : 0;
      } else if (type === this.sorting.VOTEDESC) {
        return (b.score > a.score) ? 1 : (a.score > b.score) ? -1 : 0;
      } else if (type === this.sorting.TIME) {
        const dateA = new Date(a.timestamp), dateB = new Date(b.timestamp);
        return (+dateB > +dateA) ? 1 : (+dateA > +dateB) ? -1 : 0;
      }
    });
  }

  sortCommentsManually(type: string) {
    this.scrollToTop = true;
    this.sortComments(type);
  }

  sortComments(type: string): void {
    if (this.hideCommentsList === true) {
      this.filteredComments = this.sort(this.filteredComments, type);
    } else {
      this.commentsFilteredByTime = this.sort(this.commentsFilteredByTime, type);
    }
    this.currentSort = type;
    this.globalStorageService.setItem(STORAGE_KEYS.COMMENT_SORT, this.currentSort);
    if (this.scrollToTop) {
      this.commentCounter = itemRenderNumber;
      this.scrollTop();
      this.scrollToTop = false;
    }
    this.getDisplayComments();
  }

  clickedOnTag(tag: string): void {
    this.filterComments(this.filtering.TAG, tag);
  }

  pauseCommentStream() {
    this.freeze = true;
    const msg = this.translateService.instant('comment-list.comment-stream-stopped');
    this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
    document.getElementById('start-button').focus();
  }

  playCommentStream() {
    this.freeze = false;
    this.getComments(true);
    const msg = this.translateService.instant('comment-list.comment-stream-started');
    this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
    document.getElementById('pause-button').focus();
  }

  subscribeCommentStream() {
    this.commentStream = this.wsCommentService.getCommentStream(this.roomId).subscribe((message: Message) => {
      this.parseIncomingMessage(message);
    });
  }

  subscribeModeratorStream() {
    this.moderatorStream = this.wsCommentService.getModeratorCommentStream(this.roomId).subscribe((message: Message) => {
      this.parseIncomingModeratorMessage(message);
    });
  }

  /**
   * Announces a new comment receive.
   */
  public announceNewComment(comment: Comment) {
    this.newestComment = comment;
    setTimeout(() => {
      const newCommentText: string = document.getElementById('new-comment').innerText;
      this.announceService.announce(newCommentText);
    }, 450);
  }

  setTimePeriod(period: Period) {
    this.period = period;
    const currentTime = new Date();
    const hourInSeconds = 3600000;
    let periodInSeconds;
    if (period !== Period.ALL) {
      switch (period) {
        case Period.ONEHOUR:
          periodInSeconds = hourInSeconds;
          break;
        case Period.THREEHOURS:
          periodInSeconds = hourInSeconds * 3;
          break;
        case Period.ONEDAY:
          periodInSeconds = hourInSeconds * 24;
          break;
        case Period.ONEWEEK:
          periodInSeconds = hourInSeconds * 168;
      }
      this.commentsFilteredByTime = this.comments
        .filter(c => new Date(c.timestamp).getTime() >= (currentTime.getTime() - periodInSeconds));
    } else {
      this.commentsFilteredByTime = this.comments;
    }
    this.filterComments(this.currentFilter);
    this.globalStorageService.setItem(STORAGE_KEYS.COMMENT_TIME_FILTER, this.period);
  }

  openDeleteCommentsDialog(): void {
    const dialogRef = this.dialogService.openDeleteDialog('comments', this.isModerator ? 'really-delete-banned-comments' : 'really-delete-comments');
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteComments();
      }
    });
  }

  deleteComments(): void {
    if (this.isModerator) {
      this.commentService.deleteCommentsById(this.roomId, this.comments.map(c => c.id)).subscribe(() => {
        const msg = this.translateService.instant('comment-list.banned-comments-deleted');
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      });
    } else {
      this.commentService.deleteCommentsByRoomId(this.roomId).subscribe(() => {
        const msg = this.translateService.instant('comment-list.all-comments-deleted');
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      });
    }
  }

  onExport(): void {
    this.commentService.export(this.comments, this.room);
  }

  navToSettings() {
    this.router.navigate(['edit', this.room.shortId, 'settings', 'comments']);
  }

  resetComments() {
    this.comments = [];
    this.setTimePeriod(this.period);
  }

  updateCurrentComment(comment: Comment, idChanged = false) {
    if (!idChanged) {
      if (comment.highlighted) {
        this.commentService.lowlight(comment).subscribe();
      } else {
        const highlightedComment = this.comments.filter(c => c.highlighted)[0];
        if (highlightedComment) {
          this.commentService.lowlight(highlightedComment).subscribe();
        }
        this.commentService.highlight(comment).subscribe();
      }
    }
    this.updateActiveComment.emit(comment);
    const index = this.getIndexOfComment(comment);
    const stepState = new CommentPresentationState(this.getStepState(index),comment.id);
    this.eventService.broadcast(RemoteMessage.UPDATE_COMMENT_STATE, stepState);
    this.sendCommentStateChange(comment.id);
    if (!this.isLoading && this.isPresentation) {
      this.scrollToComment(index);
      this.announceCommentPresentation(index);
    }
  }

  getIndexOfComment(comment: Comment): number {
    return Math.max(this.displayComments.indexOf(comment), 0);
  }

  getCurrentIndex(): number {
    return this.getIndexOfComment(this.activeComment);
  }

  getStepState(index) {
    let state;
    if (index === 0) {
      state = 'START';
    } else if (index === this.comments.length - 1) {
      state = 'END';
    }
    return state;
  }

  getCommentElements() {
    return document.getElementsByName('comment');
  }

  scrollToComment(index) {
    this.getCommentElements()[index].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      }
    );
  }

  sendCommentStateChange(commentId: string) {
    const remoteState = new CommentFocusState(commentId);
    this.eventService.broadcast(RemoteMessage.CHANGE_COMMENTS_STATE, remoteState);
  }

  announceCommentPresentation(index: number) {
    this.announceService.announce('presentation.a11y-present-comment', { comment: this.displayComments[index].body });
  }

  nextComment() {
    const index = this.getCurrentIndex();
    if (index < this.displayComments.length - 1) {
      const nextComment = this.displayComments[index + 1];
      this.updateCurrentComment(nextComment);
    }
  }

  prevComment() {
    const index = this.getCurrentIndex();
    if (index > 0) {
      const prevComment = this.displayComments[index -1];
      this.updateCurrentComment(prevComment);
    }
  }

  updateUrl() {
    const role = this.routingService.getRoleString(this.viewRole);
    const url = [role, this.room.shortId, 'comments'];
    if (this.isModerator) {
      url.push('moderation');
    }
    const urlTree = this.router.createUrlTree(url);
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }

  switchList(index: number) {
    this.isLoading = true;
    if (index === 1) {
      this.isModerator = true;
      this.activeComments$ = this.moderationComments$;
    } else {
      this.isModerator = false;
      this.activeComments$ = this.publicComments$;
    }
    this.init(true);
    this.updateUrl();
  }
}
