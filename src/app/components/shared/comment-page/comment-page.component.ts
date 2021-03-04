import { AfterContentInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientAuthentication } from '../../../models/client-authentication';
import { UserRole } from '../../../models/user-roles.enum';
import { NotificationService } from '../../../services/util/notification.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { EventService } from '../../../services/util/event.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { AnnounceService } from '../../../services/util/announce.service';

@Component({
  selector: 'app-comment-page',
  templateUrl: './comment-page.component.html',
  styleUrls: ['./comment-page.component.scss']
})
export class CommentPageComponent implements OnInit, OnDestroy, AfterContentInit {
  roomId: string;
  auth: ClientAuthentication;
  viewRole: UserRole;

  constructor(
    private route: ActivatedRoute,
    private notification: NotificationService,
    private authenticationService: AuthenticationService,
    private eventService: EventService,
    private announceService: AnnounceService
  ) {
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    const focusOnInput = this.eventService.focusOnInput;
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true && focusOnInput === false) {
      if (document.getElementById('add-comment-button')) {
        document.getElementById('add-comment-button').focus();
      } else {
        document.getElementById('add-comment-small-button').focus();
      }
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit2) === true && focusOnInput === false) {
      document.getElementById('search-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true && focusOnInput === false) {
      document.getElementById('sort-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit4) === true && focusOnInput === false) {
      document.getElementById('filter-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit5) === true && focusOnInput === false) {
      document.getElementById('select-time-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit6) === true && focusOnInput === false) {
      if (document.getElementById('start-button')) {
        document.getElementById('start-button').focus();
      } else {
        document.getElementById('pause-button').focus();
      }
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit7) === true && focusOnInput === false) {
      if (document.getElementById('comment-entry')) {
        document.getElementById('comment-entry').focus();
      } else {
        document.getElementById('no-comments').focus();
      }
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true && focusOnInput === false) {
      this.announce();
    } else if (document.getElementById('search-close-button') && KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true &&
      focusOnInput === true) {
      document.getElementById('search-close-button').click();
      document.getElementById('live-announcer-button').focus();
    }
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      document.getElementById('live-announcer-button').focus();
    }, 800);
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.roomId = data.room.id;
      this.viewRole = data.viewRole;
    });
    this.authenticationService.getCurrentAuthentication()
        .subscribe(auth => this.auth = auth);
  }

  ngOnDestroy() {
    this.eventService.makeFocusOnInputFalse();
  }

  public announce() {
    this.announceService.announce('comment-page.a11y-shortcuts');
  }

}
