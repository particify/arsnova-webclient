import { AfterContentInit, Component, HostListener, OnInit } from '@angular/core';
import { Room } from '../../../models/room';
import { User } from '../../../models/user';
import { UserRole } from '../../../models/user-roles.enum';
import { RoomPageComponent } from '../../shared/room-page/room-page.component';
import { Location } from '@angular/common';
import { RoomService } from '../../../services/http/room.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { WsCommentServiceService } from '../../../services/websockets/ws-comment-service.service';
import { CommentService } from '../../../services/http/comment.service';
import { ContentService } from '../../../services/http/content.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { EventService } from '../../../services/util/event.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { NotificationService } from '../../../services/util/notification.service';

@Component({
  selector: 'app-room-participant-page',
  templateUrl: './room-participant-page.component.html',
  styleUrls: ['./room-participant-page.component.scss']
})
export class RoomParticipantPageComponent extends RoomPageComponent implements OnInit, AfterContentInit {

  room: Room;
  user: User;

  constructor(protected location: Location,
              protected roomService: RoomService,
              protected route: ActivatedRoute,
              protected router: Router,
              protected notificationService: NotificationService,
              protected translateService: TranslateService,
              protected langService: LanguageService,
              protected wsCommentService: WsCommentServiceService,
              protected commentService: CommentService,
              protected contentService: ContentService,
              protected authenticationService: AuthenticationService,
              private liveAnnouncer: LiveAnnouncer,
              public eventService: EventService) {
    super(roomService, route, router, location, wsCommentService, commentService, eventService, contentService, translateService,
      notificationService);
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    const focusOnInput = this.eventService.focusOnInput;
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true && focusOnInput === false) {
      document.getElementById('comments-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true && focusOnInput === false) {
      document.getElementById('live-feedback-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit4) === true && focusOnInput === false) {
      if (this.contentGroups.length > 0) {
        document.getElementById('content-groups').focus();
      } else {
        document.getElementById('no-content-groups').focus();
      }
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit5) === true && focusOnInput === false) {
      document.getElementById('statistics-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit9, KeyboardKey.Escape) === true && focusOnInput === false) {
      this.announce();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true && focusOnInput === true) {
      this.eventService.makeFocusOnInputFalse();
    }
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      document.getElementById('live-announcer-button').focus();
    }, 700);
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.route.params.subscribe(params => {
      this.initializeRoom(params['shortId']);
    });
    this.translateService.use(localStorage.getItem('currentLang'));
  }

  public announce() {
    this.liveAnnouncer.clear();
    this.translateService.get('room-page.a11y-keys').subscribe(msg => {
      this.liveAnnouncer.announce(msg, 'assertive');
    });
  }

  afterRoomLoadHook() {
    this.authenticationService.watchUser.subscribe(user => this.user = user);
    if (!this.user) {
      this.authenticationService.guestLogin(UserRole.PARTICIPANT).subscribe(() => {
        this.roomService.addToHistory(this.room.id);
      });
    } else {
      this.roomService.addToHistory(this.room.id);
    }
    this.authenticationService.setAccess(this.room.shortId, UserRole.PARTICIPANT);
    this.authenticationService.checkAccess(this.room.shortId);
  }

  protected afterGroupsLoadHook() {
    this.isLoading = false;
  }
}
