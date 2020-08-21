import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Comment } from '../../../models/comment';
import { CommentService } from '../../../services/http/comment.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { Message } from '@stomp/stompjs';
import { WsCommentServiceService } from '../../../services/websockets/ws-comment-service.service';
import { ClientAuthentication } from 'app/models/client-authentication';
import { Vote } from '../../../models/vote';
import { UserRole } from '../../../models/user-roles.enum';
import { Room } from '../../../models/room';
import { RoomService } from '../../../services/http/room.service';
import { VoteService } from '../../../services/http/vote.service';
import { NotificationService } from '../../../services/util/notification.service';
import { CorrectWrong } from '../../../models/correct-wrong.enum';
import { EventService } from '../../../services/util/event.service';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from '../../../services/util/dialog.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { AnnounceService } from '../../../services/util/announce.service';

enum Sort {
  VOTEASC = 'VOTEASC',
  VOTEDESC = 'VOTEDESC',
  TIME = 'TIME'
}

enum Filter {
  READ = 'READ',
  UNREAD = 'UNREAD',
  FAVORITE = 'FAVORITE',
  CORRECT = 'CORRECT',
  WRONG = 'WRONG',
  ACK = 'ACK',
  TAG = 'TAG',
  ANSWER = 'ANSWER'
}

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss']
})
export class CommentListComponent implements OnInit, OnDestroy {
  @ViewChild('searchBox') searchField: ElementRef;
  @Input() auth: ClientAuthentication;
  @Input() roomId: string;
  viewRole: UserRole;
  shortId: string;
  comments: Comment[] = [];
  room: Room;
  hideCommentsList = false;
  filteredComments: Comment[];
  deviceType: string;
  isSafari: boolean;
  isLoading = true;
  currentSort: string;
  sorting = Sort;
  currentFilter: string;
  filtering = Filter;
  commentVoteMap = new Map<string, Vote>();
  scroll = false;
  scrollMax: number;
  scrollExtended = false;
  scrollExtendedMax = 500;
  searchInput = '';
  search = false;
  searchPlaceholder = '';
  moderationEnabled = false;
  directSend = true;
  thresholdEnabled = false;
  newestComment: string;
  freeze = false;
  commentStream: Subscription;

  constructor(
    private commentService: CommentService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    protected langService: LanguageService,
    private wsCommentService: WsCommentServiceService,
    protected roomService: RoomService,
    protected voteService: VoteService,
    private notificationService: NotificationService,
    public eventService: EventService,
    public announceService: AnnounceService,
    private router: Router,
    protected route: ActivatedRoute,
    private globalStorageService: GlobalStorageService
  ) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.roomId = this.globalStorageService.getItem(STORAGE_KEYS.ROOM_ID);
    this.shortId = this.route.snapshot.paramMap.get('shortId');
    const userId = this.auth.userId;
    this.currentSort = this.globalStorageService.getItem(STORAGE_KEYS.COMMENT_SORT) || this.sorting.VOTEDESC;
    this.currentFilter = '';
    this.initRoom();
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    this.deviceType = this.globalStorageService.getItem(STORAGE_KEYS.DEVICE_TYPE);
    this.isSafari = this.globalStorageService.getItem(STORAGE_KEYS.IS_SAFARI);
    this.route.data.subscribe(data => {
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
    const appPadding = document.body.clientWidth * 0.04;
    if (this.deviceType === 'desktop') {
      this.scrollMax = 55 + appPadding;
    } else {
      this.scrollMax = 46 + appPadding;
    }
  }

  ngOnDestroy() {
    if (!this.freeze && this.commentStream) {
      this.commentStream.unsubscribe();
    }
  }

  initRoom() {
    this.roomService.getRoomByShortId(this.shortId).subscribe(room => {
      this.room = room;
      if (this.room && this.room.extensions && this.room.extensions['comments']) {
        if (this.room.extensions['comments'].enableModeration !== null) {
          this.moderationEnabled = this.room.extensions['comments'].enableModeration;
          this.globalStorageService.setItem(STORAGE_KEYS.MODERATION_ENABLED,
            this.room.extensions['comments'].enableModeration);
        }
        if (this.room.extensions['comments'].directSend !== null) {
          this.directSend = this.room.extensions['comments'].directSend;
        }
      }
      this.commentService.getAckComments(this.roomId)
        .subscribe(comments => {
          this.comments = comments;
          this.getComments();
        });
    });
    this.subscribeCommentStream();
  }

  checkScroll(): void {
    const currentScroll = document.documentElement.scrollTop;
    this.scroll = currentScroll >= this.scrollMax;
    this.scrollExtended = currentScroll >= this.scrollExtendedMax;
  }

  scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  searchComments(): void {
    if (this.searchInput) {
      if (this.searchInput.length > 2) {
        this.hideCommentsList = true;
        this.filteredComments = this.comments.filter(c => c.body.toLowerCase().includes(this.searchInput.toLowerCase()));
      }
    } else if (this.searchInput.length === 0 && this.currentFilter === '') {
      this.hideCommentsList = false;
    }
  }

  activateSearch() {
    this.translateService.get('comment-list.search').subscribe(msg => {
      this.searchPlaceholder = msg;
    });
    this.search = true;
    this.searchField.nativeElement.focus();
  }

  getComments(): void {
    if (this.room && this.room.extensions && this.room.extensions['comments']) {
      if (this.room.extensions['comments'].enableThreshold) {
        this.thresholdEnabled = true;
      } else {
        this.thresholdEnabled = false;
      }
    }
    let commentThreshold;
    if (this.thresholdEnabled) {
      commentThreshold = this.room.extensions['comments'].commentThreshold;
      if (this.hideCommentsList) {
        this.filteredComments = this.filteredComments.filter(x => x.score >= commentThreshold);
      } else {
        this.comments = this.comments.filter(x => x.score >= commentThreshold);
      }
    }
    this.filterComments(this.currentFilter);
    this.sortComments(this.currentSort);
    this.isLoading = false;
  }

  getVote(comment: Comment): Vote {
    if (this.viewRole === UserRole.PARTICIPANT) {
      return this.commentVoteMap.get(comment.id);
    }
  }

  parseIncomingMessage(message: Message) {
    const msg = JSON.parse(message.body);
    const payload = msg.payload;
    switch (msg.type) {
      case 'CommentCreated':
        const c = new Comment();
        c.roomId = this.roomId;
        c.body = payload.body;
        c.id = payload.id;
        c.timestamp = payload.timestamp;
        c.tag = payload.tag;

        this.announceNewComment(c.body);

        this.comments = this.comments.concat(c);
        break;
      case 'CommentPatched':
        // ToDo: Use a map for comments w/ key = commentId
        for (let i = 0; i < this.comments.length; i++) {
          if (payload.id === this.comments[i].id) {
            for (const [key, value] of Object.entries(payload.changes)) {
              switch (key) {
                case this.filtering.READ:
                  this.comments[i].read = <boolean>value;
                  break;
                case this.filtering.CORRECT:
                  this.comments[i].correct = <CorrectWrong>value;
                  break;
                case this.filtering.FAVORITE:
                  this.comments[i].favorite = <boolean>value;
                  if (this.auth.userId === this.comments[i].creatorId && <boolean>value) {
                    this.translateService.get('comment-list.comment-got-favorited').subscribe(ret => {
                      this.notificationService.show(ret);
                    });
                  }
                  break;
                case 'score':
                  this.comments[i].score = <number>value;
                  this.getComments();
                  break;
                case this.filtering.ACK:
                  const isNowAck = <boolean>value;
                  if (!isNowAck) {
                    this.comments = this.comments.filter(function (el) {
                      return el.id !== payload.id;
                    });
                  }
                  break;
                case this.filtering.TAG:
                  this.comments[i].tag = <string>value;
                  break;
                case this.filtering.ANSWER:
                  this.comments[i].answer = <string>value;
                  break;
              }
            }
          }
        }
        break;
      case 'CommentHighlighted':
        // ToDo: Use a map for comments w/ key = commentId
        for (let i = 0; i < this.comments.length; i++) {
          if (payload.id === this.comments[i].id) {
            this.comments[i].highlighted = <boolean>payload.lights;
          }
        }
        break;
      case 'CommentDeleted':
        for (let i = 0; i < this.comments.length; i++) {
          this.comments = this.comments.filter(function (el) {
            return el.id !== payload.id;
          });
        }
        break;
    }
    this.filterComments(this.currentFilter);
    this.sortComments(this.currentSort);
    this.searchComments();
  }

  openCreateDialog(): void {
    let tags;
    if (this.room.extensions && this.room.extensions['tags'] && this.room.extensions['tags'].tags) {
      tags = this.room.extensions['tags'].tags;
    }
    const dialogRef = this.dialogService.openCreateCommentDialog(this.auth, tags);
    dialogRef.afterClosed()
      .subscribe(result => {
        if (result) {
          this.send(result);
        } else {
          return;
        }
      });
  }

  send(comment: Comment): void {
    let message;
    this.commentService.addComment(comment).subscribe(returned => {
      if (this.directSend) {
        if ([UserRole.CREATOR, UserRole.EDITING_MODERATOR, UserRole.EXECUTIVE_MODERATOR].indexOf(this.viewRole) !== -1) {
          this.translateService.get('comment-list.comment-sent').subscribe(msg => {
            message = msg;
          });
          comment.ack = true;
        } else {
          this.translateService.get('comment-list.comment-sent-to-moderator').subscribe(msg => {
            message = msg;
          });
        }
      } else {
        this.translateService.get('comment-list.comment-sent').subscribe(msg => {
          message = msg;
        });
      }
      this.notificationService.show(message);
    });
  }

  filterComments(type: string, tag?: string): void {
    if (type === '' || (this.currentFilter === this.filtering.TAG && type === this.filtering.TAG)) {
      this.filteredComments = this.comments;
      this.hideCommentsList = false;
      this.currentFilter = '';
      return;
    }
    this.filteredComments = this.comments.filter(c => {
      switch (type) {
        case this.filtering.CORRECT:
          return c.correct === CorrectWrong.CORRECT ? 1 : 0;
        case this.filtering.WRONG:
          return c.correct === CorrectWrong.WRONG ? 1 : 0;
        case this.filtering.FAVORITE:
          return c.favorite;
        case this.filtering.READ:
          return c.read;
        case this.filtering.UNREAD:
          return !c.read;
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

  sortComments(type: string): void {
    if (this.hideCommentsList === true) {
      this.filteredComments = this.sort(this.filteredComments, type);
    } else {
      this.comments = this.sort(this.comments, type);
    }
    this.currentSort = type;
    this.globalStorageService.setItem(STORAGE_KEYS.COMMENT_SORT, this.currentSort);
  }

  clickedOnTag(tag: string): void {
    this.filterComments(this.filtering.TAG, tag);
  }

  pauseCommentStream() {
    this.freeze = true;
    this.commentStream.unsubscribe();
    this.translateService.get('comment-list.comment-stream-stopped').subscribe(msg => {
      this.notificationService.show(msg);
    });
  }

  playCommentStream() {
    this.freeze = false;
    this.commentService.getAckComments(this.roomId)
      .subscribe(comments => {
        this.comments = comments;
        this.getComments();
      });
    this.subscribeCommentStream();
    this.translateService.get('comment-list.comment-stream-started').subscribe(msg => {
      this.notificationService.show(msg);
    });
  }

  subscribeCommentStream() {
    this.commentStream = this.wsCommentService.getCommentStream(this.roomId).subscribe((message: Message) => {
      this.parseIncomingMessage(message);
    });
  }

  switchToModerationList(): void {
    this.router.navigate([`/moderator/room/${this.room.shortId}/moderator/comments`]);
  }

  /**
   * Announces a new comment receive.
   */
  public announceNewComment(comment: string) {
    this.newestComment = comment;
    setTimeout(() => {
      const newCommentText: string = document.getElementById('new-comment').innerText;
      this.announceService.announce(newCommentText);
    }, 450);
  }
}
