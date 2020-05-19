import { AfterContentInit, Component, HostListener, OnInit } from '@angular/core';
import { RoomService } from '../../../services/http/room.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomPageComponent } from '../../shared/room-page/room-page.component';
import { Location } from '@angular/common';
import { NotificationService } from '../../../services/util/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { WsCommentServiceService } from '../../../services/websockets/ws-comment-service.service';
import { CommentService } from '../../../services/http/comment.service';
import { EventService } from '../../../services/util/event.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { ContentService } from '../../../services/http/content.service';
import { DialogService } from '../../../services/util/dialog.service';
import { GlobalStorageService, LocalStorageKey, MemoryStorageKey } from '../../../services/util/global-storage.service';
import { Content } from '../../../models/content';
import { AnnounceService } from '../../../services/util/announce.service';
import { Observable, Subscription } from 'rxjs';
import { Message, IMessage } from '@stomp/stompjs';

@Component({
  selector: 'app-room-creator-page',
  templateUrl: './room-creator-page.component.html',
  styleUrls: ['./room-creator-page.component.scss']
})
export class RoomCreatorPageComponent extends RoomPageComponent implements OnInit, AfterContentInit {

  viewModuleCount = 1;
  moderatorCommentCounter: number;
  looseContent: Content[] = [];
  moderationCommentWatch: Observable<IMessage>;
  moderationSub: Subscription;

  constructor(
    protected roomService: RoomService,
    protected notification: NotificationService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected location: Location,
    public dialog: MatDialog,
    protected translateService: TranslateService,
    protected langService: LanguageService,
    protected wsCommentService: WsCommentServiceService,
    protected commentService: CommentService,
    private announceService: AnnounceService,
    public eventService: EventService,
    protected contentService: ContentService,
    private dialogService: DialogService,
    protected globalStorageService: GlobalStorageService
  ) {
    super(roomService, route, router, location, wsCommentService, commentService, eventService, contentService, translateService,
      notification, globalStorageService);
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    const focusOnInput = this.eventService.focusOnInput;
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true && focusOnInput === false) {
      if (this.moderationEnabled) {
        document.getElementById('comments-button').focus();
      } else {
        document.getElementById('comments-button2').focus();
      }
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit2) === true && focusOnInput === false) {
      if (this.moderationEnabled) {
        document.getElementById('moderation-button').focus();
      } else {
        document.getElementById('moderation-disabled').focus();
      }
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true && focusOnInput === false) {
      document.getElementById('content-create-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit4) === true && focusOnInput === false) {
      document.getElementById('live-survey-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit5) === true && focusOnInput === false) {
      if (this.contentGroups.length > 0) {
        document.getElementById('content-groups').focus();
      } else {
        document.getElementById('no-content-groups').focus();
      }
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit6) === true && focusOnInput === false) {
      document.getElementById('statistics-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit7) === true && focusOnInput === false) {
      document.getElementById('settings-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit8) === true) {
      document.getElementById('qr-code-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true && focusOnInput === false) {
      this.announce();
    }
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      document.getElementById('live-announcer-button').focus();
    }, 700);
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.translateService.use(this.globalStorageService.getLocalStorageItem(LocalStorageKey.LANGUAGE));
    this.route.data.subscribe(data => {
      this.initializeRoom(data.room);
    });
  }

  announce() {
    this.announceService.announce('room-page.a11y-shortcuts');
  }

  afterRoomLoadHook() {
    if (this.moderationEnabled) {
      this.viewModuleCount = this.viewModuleCount + 1;
      this.commentService.countByRoomId(this.room.id, false).subscribe(commentCounter => {
        this.moderatorCommentCounter = commentCounter;
      });

      this.commentWatch = this.wsCommentService.getCommentStream(this.room.id);
      this.moderationCommentWatch = this.wsCommentService.getModeratorCommentStream(this.room.id);

      this.sub.unsubscribe();

      this.sub = this.commentWatch.subscribe((message: Message) => {
        const msg = JSON.parse(message.body);
        const payload = msg.payload;
        if (msg.type === 'CommentCreated') {
          this.commentCounter = this.commentCounter + 1;
        } else if (msg.type === 'CommentDeleted') {
          this.commentCounter = this.commentCounter - 1;
        } else if (msg.type === 'CommentPatched') {
          for (const [key, value] of Object.entries(payload.changes)) {
            switch (key) {
              case 'ack':
                const isNowAck = <boolean>value;
                if (isNowAck) {
                  this.moderatorCommentCounter = this.moderatorCommentCounter - 1;
                } else {
                  this.commentCounter = this.commentCounter - 1;
                }
                break;
            }
          }
        }
      });
      this.moderationSub = this.moderationCommentWatch.subscribe((message: Message) => {
        const msg = JSON.parse(message.body);
        const payload = msg.payload;
        if (msg.type === 'CommentCreated') {
          this.moderatorCommentCounter = this.moderatorCommentCounter + 1;
        } else if (msg.type === 'CommentDeleted') {
          this.moderatorCommentCounter = this.moderatorCommentCounter - 1;
        }
      });
    }
  }

  afterGroupsLoadHook() {
    this.contentService.findContentsWithoutGroup(this.room.id).subscribe(contents => {
      this.looseContent = contents;
      this.isLoading = false;
    });
    this.globalStorageService.setMemoryItem(MemoryStorageKey.CONTENT_GROUPS, this.groupNames);
  }

  public showQRDialog() {
    const dialogRef = this.dialogService.openQRCodeDialog(
      window.location.protocol + '//',
      window.location.hostname,
      this.room.shortId,
      true
    );
    dialogRef.afterClosed().subscribe(() => {
      setTimeout(() => {
        document.getElementById('live-announcer-button').focus();
      }, 300);
    });
  }
}

