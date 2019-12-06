import { Component, OnInit, Renderer2, OnDestroy, AfterContentInit } from '@angular/core';
import { RoomService } from '../../../services/http/room.service';
import { ActivatedRoute } from '@angular/router';
import { RoomPageComponent } from '../../shared/room-page/room-page.component';
import { Room } from '../../../models/room';
import { CommentSettingsDialog } from '../../../models/comment-settings-dialog';
import { Location } from '@angular/common';
import { NotificationService } from '../../../services/util/notification.service';
import { MatDialog } from '@angular/material';
import { RoomEditComponent } from '../_dialogs/room-edit/room-edit.component';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { TSMap } from 'typescript-map';
import { WsCommentServiceService } from '../../../services/websockets/ws-comment-service.service';
import { CommentService } from '../../../services/http/comment.service';
import { ModeratorsComponent } from '../_dialogs/moderators/moderators.component';
import { BonusTokenComponent } from '../_dialogs/bonus-token/bonus-token.component';
import { CommentSettingsComponent } from '../_dialogs/comment-settings/comment-settings.component';
import { TagsComponent } from '../_dialogs/tags/tags.component';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { EventService } from '../../../services/util/event.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { ContentService } from '../../../services/http/content.service';
import { ContentGroupCreationComponent } from '../_dialogs/content-group-creation/content-group-creation.component';
import { ContentGroup } from '../../../models/content-group';

@Component({
  selector: 'app-room-creator-page',
  templateUrl: './room-creator-page.component.html',
  styleUrls: ['./room-creator-page.component.scss']
})
export class RoomCreatorPageComponent extends RoomPageComponent implements OnInit, OnDestroy, AfterContentInit {
  room: Room;
  updRoom: Room;
  commentThreshold: number;
  deviceType = localStorage.getItem('deviceType');
  viewModuleCount = 1;
  moderatorCommentCounter: number;
  urlToCopy = `${window.location.protocol}//${window.location.hostname}/participant/room/`;
  defaultContentGroups: ContentGroup[] = [];
  emptyDefaultGroups = true;

  constructor(protected roomService: RoomService,
              protected notification: NotificationService,
              protected route: ActivatedRoute,
              protected location: Location,
              public dialog: MatDialog,
              private translateService: TranslateService,
              protected langService: LanguageService,
              protected wsCommentService: WsCommentServiceService,
              protected commentService: CommentService,
              private liveAnnouncer: LiveAnnouncer,
              private _r: Renderer2,
              public eventService: EventService,
              protected contentService: ContentService) {
    super(roomService, route, location, wsCommentService, commentService, eventService, contentService);
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  static saveGroupInSessionStorage(name: string): boolean {
    const groups: string [] = JSON.parse(sessionStorage.getItem('contentGroups'));
    for (let i = 0; i < groups.length; i++) {
      if (name === groups[i]) {
        return false;
      }
    }
    groups.push(name);
    sessionStorage.setItem('contentGroups', JSON.stringify(groups));
    return true;
  }

  ngAfterContentInit(): void {
    setTimeout( () => {
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
    this.contentService.findContentsWithoutGroup(this.room.id).subscribe(contents => {
        if (contents) {
          let contentWithoutGroupName = '';
          this.translateService.get('content.contents-without-collection').subscribe(msg => {
            contentWithoutGroupName = msg;
          });
          this.defaultContentGroups.push(new ContentGroup('', '', contentWithoutGroupName, [], true));
          for (const c of contents) {
            this.defaultContentGroups[0].contentIds.push(c.id);
          }
          if (contents && contents.length > 0) {
            this.emptyDefaultGroups = false;
          }
        }
      });
  }

  updateGeneralSettings() {
    this.room.name = this.updRoom.name;
    this.room.description = this.updRoom.description;
    this.saveChanges();
  }

  updateCommentSettings(settings: CommentSettingsDialog) {
    const commentExtension: TSMap<string, any> = new TSMap();
    commentExtension.set('enableThreshold', settings.enableThreshold);
    commentExtension.set('commentThreshold', settings.threshold);
    commentExtension.set('enableModeration', settings.enableModeration);
    commentExtension.set('enableTags', settings.enableTags);
    commentExtension.set('tags', settings.tags);
    this.room.extensions['comments'] = commentExtension;

    if (this.moderationEnabled && !settings.enableModeration) {
      this.viewModuleCount = this.viewModuleCount - 1;
    } else if (!this.moderationEnabled && settings.enableModeration) {
      this.viewModuleCount = this.viewModuleCount + 1;
    }

    this.moderationEnabled = settings.enableModeration;
    localStorage.setItem('moderationEnabled', String(this.moderationEnabled));
  }

  resetThreshold(): void {
    if (this.room.extensions && this.room.extensions['comments']) {
      delete this.room.extensions['comments'];
    }
  }

  saveChanges() {
    this.roomService.updateRoom(this.room)
      .subscribe((room) => {
        this.room = room;
        this.translateService.get('room-page.changes-successful').subscribe(msg => {
          this.notification.show(msg);
        });
      });
  }

  showSettingsDialog(): void {
    this.updRoom = JSON.parse(JSON.stringify(this.room));
    const dialogRef = this.dialog.open(RoomEditComponent, {
      width: '400px'
    });
    dialogRef.componentInstance.editRoom = this.updRoom;
    dialogRef.afterClosed()
      .subscribe(result => {
        if (result === 'abort') {
          return;
        } else if (result !== 'delete') {
          this.updateGeneralSettings();
        }
      });
    dialogRef.backdropClick().subscribe( res => {
        dialogRef.close('abort');
    });
  }

  showCommentsDialog(): void {
    this.updRoom = JSON.parse(JSON.stringify(this.room));

    const dialogRef = this.dialog.open(CommentSettingsComponent, {
      width: '400px'
    });
    dialogRef.componentInstance.roomId = this.room.id;
    dialogRef.componentInstance.editRoom = this.updRoom;
    dialogRef.afterClosed()
      .subscribe(result => {
        if (result === 'abort') {
          return;
        } else {
          if (result instanceof CommentSettingsDialog) {
            this.updateCommentSettings(result);
            this.saveChanges();
          }
        }
      });
    dialogRef.backdropClick().subscribe( res => {
      dialogRef.close('abort');
    });
  }

  showModeratorsDialog(): void {
    const dialogRef = this.dialog.open(ModeratorsComponent, {
      width: '400px'
    });
    dialogRef.componentInstance.roomId = this.room.id;
  }

  showBonusTokenDialog(): void {
    const dialogRef = this.dialog.open(BonusTokenComponent, {
      width: '400px'
    });
    dialogRef.componentInstance.room = this.room;
  }

  showTagsDialog(): void {
    const dialogRef = this.dialog.open(TagsComponent, {
      width: '400px'
    });
    let tagExtension;
    if (this.room.extensions !== undefined && this.room.extensions['tags'] !== undefined) {
      tagExtension = this.room.extensions['tags'];
    }
    dialogRef.componentInstance.extension = tagExtension;
    dialogRef.afterClosed()
      .subscribe(result => {
        if (result === 'abort') {
          return;
        } else {
          this.room.extensions['tags'] = result;
          this.saveChanges();
        }
      });
  }

  showContentGroupCreationDialog(): void {
    const dialogRef = this.dialog.open(ContentGroupCreationComponent, {
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (RoomCreatorPageComponent.saveGroupInSessionStorage(result)) {
          this.translateService.get('room-page.content-group-created').subscribe(msg => {
            this.notification.show(msg);
          });
        } else {
          this.translateService.get('room-page.content-group-already-exists').subscribe(msg => {
            this.notification.show(msg);
          });
        }
      }
    });
  }

  copyShortId(): void {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = `${this.urlToCopy}${this.room.shortId}`;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.translateService.get('room-page.session-id-copied').subscribe(msg => {
      this.notification.show(msg, '', { duration: 2000 });
    });
  }
}

