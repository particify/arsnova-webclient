import { AfterContentInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../../models/user';
import { NotificationService } from '../../../services/util/notification.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { EventService } from '../../../services/util/event.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-comment-page',
  templateUrl: './comment-page.component.html',
  styleUrls: ['./comment-page.component.scss']
})
export class CommentPageComponent implements OnInit, OnDestroy, AfterContentInit {
  roomId: string;
  user: User;

  constructor(
    private route: ActivatedRoute,
    private notification: NotificationService,
    private authenticationService: AuthenticationService,
    private eventService: EventService,
    private liveAnnouncer: LiveAnnouncer,
    private translateService: TranslateService
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
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true && focusOnInput === false) {
      document.getElementById('search-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit4) === true && focusOnInput === false) {
      document.getElementById('sort-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit5) === true && focusOnInput === false) {
      document.getElementById('filter-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit6) === true && focusOnInput === false) {
      if ( document.getElementById('start-button')) {
        document.getElementById('start-button').focus();
      } else {
        document.getElementById('pause-button').focus();
      }
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit7) === true && focusOnInput === false) {
      document.getElementById('comment-describer').focus();
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
      this.roomId = data.room;
    });
    this.user = this.authenticationService.getUser();
  }

  ngOnDestroy() {
    this.eventService.makeFocusOnInputFalse();
  }

  public announce() {
    this.translateService.get('comment-page.a11y-keys').subscribe(msg => {
      this.liveAnnouncer.clear();
      this.liveAnnouncer.announce(msg, 'assertive');
    });
  }

}
