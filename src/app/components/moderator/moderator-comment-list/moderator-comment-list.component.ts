import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Comment } from '../../../models/comment';
import { CommentService } from '../../../services/http/comment.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { Message } from '@stomp/stompjs';
import { MatDialog } from '@angular/material/dialog';
import { WsCommentServiceService } from '../../../services/websockets/ws-comment-service.service';
import { Vote } from '../../../models/vote';
import { UserRole } from '../../../models/user-roles.enum';
import { Room } from '../../../models/room';
import { RoomService } from '../../../services/http/room.service';
import { EventService } from '../../../services/util/event.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { AnnounceService } from '@arsnova/app/services/util/announce.service';
import { KeyboardUtils } from '@arsnova/app/utils/keyboard';
import { KeyboardKey } from '@arsnova/app/utils/keyboard/keys';
import { Subject } from 'rxjs';

enum Period {
  ONEHOUR = 'time-1h',
  THREEHOURS = 'time-3h',
  ONEDAY = 'time-1d',
  ONEWEEK = 'time-1w',
  ALL = 'time-all'
}

export const itemRenderNumber = 20;

@Component({
  selector: 'app-moderator-comment-list',
  templateUrl: './moderator-comment-list.component.html',
  styleUrls: ['./moderator-comment-list.component.scss']
})
export class ModeratorCommentListComponent implements OnInit {
  @ViewChild('searchBox') searchField: ElementRef;
  @Input() roomId: string;
  comments: Comment[] = [];
  room: Room;
  hideCommentsList = false;
  filteredComments: Comment[];
  deviceType: string;
  viewRole: UserRole;
  isLoading = true;
  voteasc = 'voteasc';
  votedesc = 'votedesc';
  time = 'time';
  currentSort: string;
  ack = 'ack';
  commentVoteMap = new Map<string, Vote>();
  scroll = false;
  scrollMax: number;
  scrollExtended = false;
  scrollExtendedMax = 500;
  searchInput = '';
  search = false;
  searchPlaceholder = '';
  commentsFilteredByTime: Comment[] = [];
  displayComments: Comment[] = [];
  commentCounter = itemRenderNumber;
  newestComment: Comment = new Comment();
  referenceEvent: Subject<string> = new Subject<string>();
  periodsList = Object.values(Period);
  period: Period;
  navBarExists = false;
  lastScroll = 0;
  scrollActive = false;

  constructor(
    private route: ActivatedRoute,
    private commentService: CommentService,
    private translateService: TranslateService,
    public dialog: MatDialog,
    protected langService: LanguageService,
    private wsCommentService: WsCommentServiceService,
    protected roomService: RoomService,
    public eventService: EventService,
    private router: Router,
    private globalStorageService: GlobalStorageService,
    private announceService: AnnounceService
  ) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (document.getElementById('search-close-button') && KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true) {
      document.getElementById('search-close-button').click();
      document.getElementById('live-announcer-button').focus();
    }
  }

  ngOnInit() {
    this.route.data.subscribe(data => this.viewRole = data.viewRole);
    this.roomId = this.globalStorageService.getItem(STORAGE_KEYS.ROOM_ID);
    this.roomService.getRoom(this.roomId).subscribe(room => this.room = room);
    this.period = this.globalStorageService.getItem(STORAGE_KEYS.COMMENT_TIME_FILTER) || Period.ALL;
    this.hideCommentsList = false;
    this.wsCommentService.getModeratorCommentStream(this.roomId).subscribe((message: Message) => {
      this.parseIncomingModeratorMessage(message);
    });
    this.wsCommentService.getCommentStream(this.roomId).subscribe((message: Message) => {
      this.parseIncomingMessage(message);
    });
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    this.currentSort = this.globalStorageService.getItem(STORAGE_KEYS.COMMENT_SORT) || this.time;
    this.commentService.getRejectedComments(this.roomId)
      .subscribe(comments => {
        this.comments = comments;
        this.setTimePeriod(this.period);
        this.isLoading = false;
      });
    this.translateService.get('comment-list.search').subscribe(msg => {
      this.searchPlaceholder = msg;
    });
    this.deviceType = innerWidth > 1000 ? 'desktop' : 'mobile';
    // Header height is 56 if smaller than 600px
    if (innerWidth >= 600) {
      this.scrollMax = 64;
    } else {
      this.scrollMax = 56;
    }
  }

  checkIfNavBarExists(navBarExists: boolean) {
    this.navBarExists = navBarExists;
  }

  checkScroll(): void {
    const currentScroll = document.documentElement.scrollTop;
    this.scroll = currentScroll >= this.scrollMax;
    this.scrollActive = this.scroll && currentScroll < this.lastScroll;
    this.scrollExtended = currentScroll >= this.scrollExtendedMax;
    const length = this.hideCommentsList ? this.filteredComments.length : this.commentsFilteredByTime.length;
    if (this.displayComments.length !== length) {
      if (((window.innerHeight * 2) + window.scrollY) >= document.body.scrollHeight) {
        this.commentCounter += itemRenderNumber / 2;
        this.getDisplayComments();
      }
    }
    this.lastScroll = currentScroll;
  }

  scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  searchComments(): void {
    if (this.searchInput && this.searchInput.length > 2) {
      this.hideCommentsList = true;
      this.filteredComments = this.commentsFilteredByTime
        .filter(c => c.body.toLowerCase().includes(this.searchInput.toLowerCase()));
    } else if (this.searchInput.length === 0) {
      this.hideCommentsList = false;
    }
    this.getDisplayComments();
  }

  activateSearch() {
    this.translateService.get('comment-list.search').subscribe(msg => {
      this.searchPlaceholder = msg;
    });
    this.search = true;
    this.searchField.nativeElement.focus();
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

  parseIncomingMessage(message: Message) {
    const msg = JSON.parse(message.body);
    const payload = msg.payload;
    switch (msg.type) {
      case 'CommentPatched':
        // ToDo: Use a map for comments w/ key = commentId
        for (let i = 0; i < this.comments.length; i++) {
          if (payload.id === this.comments[i].id) {
            for (const [key, value] of Object.entries(payload.changes)) {
              if (key === this.ack) {
                const isNowAck = <boolean>value;
                if (isNowAck) {
                  this.comments = this.comments.filter(function (el) {
                    return el.id !== payload.id;
                  });
                }
              }
            }
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
      default:
        this.referenceEvent.next(payload.id);
    }
    this.setTimePeriod(this.period);
    this.sortComments(this.currentSort);
    this.searchComments();
  }


  parseIncomingModeratorMessage(message: Message) {
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
        c.answer = payload.answer;
        c.favorite = payload.favorite;
        c.correct = payload.correct;
        this.comments = this.comments.concat(c);
        this.announceNewComment(c);
        break;
    }
    this.setTimePeriod(this.period);
    this.sortComments(this.currentSort);
    this.searchComments();
  }

  sort(array: any[], type: string): void {
    array.sort((a, b) => {
      if (type === this.voteasc) {
        return (a.score > b.score) ? 1 : (b.score > a.score) ? -1 : 0;
      } else if (type === this.votedesc) {
        return (b.score > a.score) ? 1 : (a.score > b.score) ? -1 : 0;
      }
      const dateA = new Date(a.timestamp), dateB = new Date(b.timestamp);
      if (type === this.time) {
        return (+dateB > +dateA) ? 1 : (+dateA > +dateB) ? -1 : 0;
      }
    });
  }

  sortComments(type: string, manually?: boolean): void {
    if (this.hideCommentsList === true) {
      this.sort(this.filteredComments, type);
    } else {
      this.sort(this.commentsFilteredByTime, type);
    }
    this.currentSort = type;
    this.globalStorageService.setItem(STORAGE_KEYS.COMMENT_SORT, this.currentSort);
    this.getDisplayComments();
    if (manually) {
      this.scrollTop();
    }
  }

  switchToCommentList(): void {
    let role;
    if (this.viewRole === UserRole.CREATOR) {
      role = 'creator';
    } else if (this.viewRole === UserRole.EXECUTIVE_MODERATOR) {
      role = 'moderator';
    }
    this.router.navigate([`/${role}/room/${this.room.shortId}/comments`]);
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
    this.sortComments(this.currentSort);
    this.globalStorageService.setItem(STORAGE_KEYS.COMMENT_TIME_FILTER, this.period);
  }
}
