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
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { EventService } from '../../../services/util/event.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { ContentService } from '../../../services/http/content.service';
import { ContentGroup } from '../../../models/content-group';
import { DialogService } from '../../../services/util/dialog.service';

@Component({
  selector: 'app-room-creator-page',
  templateUrl: './room-creator-page.component.html',
  styleUrls: ['./room-creator-page.component.scss']
})
export class RoomCreatorPageComponent extends RoomPageComponent implements OnInit, AfterContentInit {

  viewModuleCount = 1;
  moderatorCommentCounter: number;

  constructor(protected roomService: RoomService,
              protected notification: NotificationService,
              protected route: ActivatedRoute,
              protected router: Router,
              protected location: Location,
              public dialog: MatDialog,
              protected translateService: TranslateService,
              protected langService: LanguageService,
              protected wsCommentService: WsCommentServiceService,
              protected commentService: CommentService,
              private liveAnnouncer: LiveAnnouncer,
              public eventService: EventService,
              protected contentService: ContentService,
              private dialogService: DialogService) {
    super(roomService, route, router, location, wsCommentService, commentService, eventService, contentService, translateService,
      notification);
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
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true && focusOnInput === false) {
      if (this.moderationEnabled) {
        document.getElementById('moderation-button').focus();
      } else {
        document.getElementById('moderation-disabled').focus();
      }
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit4) === true && focusOnInput === false) {
      document.getElementById('content-create-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit5) === true && focusOnInput === false) {
      document.getElementById('live-feedback-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit6) === true && focusOnInput === false) {
      if (this.contentGroups.length > 0) {
        document.getElementById('content-groups').focus();
      } else {
        document.getElementById('no-content-groups').focus();
      }
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit7) === true && focusOnInput === false) {
      document.getElementById('statistics-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit8) === true && focusOnInput === false) {
      document.getElementById('settings-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit9) === true) {
      document.getElementById('qr-code-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true && focusOnInput === false) {
      this.announce();
    }
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      document.getElementById('live_announcer-button').focus();
    }, 700);
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.translateService.use(localStorage.getItem('currentLang'));
    this.route.params.subscribe(params => {
      this.initializeRoom(params['shortId']);
    });
  }

  announce() {
    this.liveAnnouncer.clear();
    this.translateService.get('room-page.a11y-keys').subscribe(msg => {
      this.liveAnnouncer.announce(msg, 'assertive');
    });
  }

  afterRoomLoadHook() {
    if (this.moderationEnabled) {
      this.viewModuleCount = this.viewModuleCount + 1;
      this.commentService.countByRoomId(this.room.id, false).subscribe(commentCounter => {
        this.moderatorCommentCounter = commentCounter;
      });
    }
  }

  afterGroupsLoadHook() {
    this.contentService.findContentsWithoutGroup(this.room.id).subscribe(contents => {
      if (contents.length > 0) {
        let contentWithoutGroupName = '';
        this.translateService.get('content.contents-without-collection').subscribe(msg => {
          contentWithoutGroupName = msg;
          this.groupNames.push(contentWithoutGroupName);
        });
        this.contentGroups.push(new ContentGroup('', '', contentWithoutGroupName, [], true));
        for (const c of contents) {
          this.contentGroups[this.contentGroups.length - 1].contentIds.push(c.id);
        }
        this.isLoading = false;
      } else {
        this.isLoading = false;
      }
    });
    sessionStorage.setItem('contentGroups', JSON.stringify(this.groupNames));
  }

  public showQRDialog() {
    const dialogRef = this.dialogService.openQRCodeDialog(window.location.protocol, window.location.hostname, this.room.shortId, true);
    dialogRef.afterClosed().subscribe(() => {
      setTimeout(() => {
        document.getElementById('live-announcer-button').focus();
      }, 300);
    });
  }
}

