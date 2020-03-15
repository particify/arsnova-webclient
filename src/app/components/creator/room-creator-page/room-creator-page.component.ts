import { AfterContentInit, Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
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

@Component({
  selector: 'app-room-creator-page',
  templateUrl: './room-creator-page.component.html',
  styleUrls: ['./room-creator-page.component.scss']
})
export class RoomCreatorPageComponent extends RoomPageComponent implements OnInit, OnDestroy, AfterContentInit {

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
              private _r: Renderer2,
              public eventService: EventService,
              protected contentService: ContentService) {
    super(roomService, route, router, location, wsCommentService, commentService, eventService, contentService, translateService,
      notification);
    langService.langEmitter.subscribe(lang => translateService.use(lang));
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
    this.listenerFn = this._r.listen(document, 'keyup', (event) => {
      if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true && this.eventService.focusOnInput === false) {
        document.getElementById('question_answer-button').focus();
      } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true && this.eventService.focusOnInput === false) {
        document.getElementById('gavel-button').focus();
      } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit4) === true && this.eventService.focusOnInput === false) {
        document.getElementById('settings-menu').focus();
      } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit8) === true && this.eventService.focusOnInput === false) {
        this.liveAnnouncer.clear();
        this.liveAnnouncer.announce('Aktueller Sitzungs-Name: ' + this.room.name + '. ' +
          'Aktueller Sitzungs-Code: ' + this.room.shortId.slice(0, 8));
      } else if (
        KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit9, KeyboardKey.Escape) === true &&
        this.eventService.focusOnInput === false
      ) {
        this.announce();
      } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true && this.eventService.focusOnInput === true) {
        this.eventService.makeFocusOnInputFalse();
      }
    });
  }

  public announce() {
    this.liveAnnouncer.clear();
    this.liveAnnouncer.announce('Du befindest dich in der von dir erstellten Sitzung. ' +
      'Drücke die Taste 1 um auf die Fragen-Übersicht zu gelangen, ' +
      'die Taste 2 um das Sitzungs-Menü zu öffnen, die Taste 3 um in die Moderationsübersicht zu gelangen, ' +
      'die Taste 4 um Einstellungen an der Sitzung vorzunehmen, ' +
      'die Taste 8 um den aktuellen Sitzungs-Code zu hören, die Taste 0 um auf den Zurück-Button zu gelangen, ' +
      'oder die Taste 9 um diese Ansage zu wiederholen.', 'assertive');
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
}

