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
import { GlobalStorageService, LocalStorageKey, MemoryStorageKey } from '../../../services/util/global-storage.service';

@Component({
  selector: 'app-moderator-comment-page',
  templateUrl: './moderator-comment-page.component.html',
  styleUrls: ['./moderator-comment-page.component.scss']
})
export class ModeratorCommentPageComponent implements OnInit, OnDestroy, AfterContentInit {
  roomId: string;
  user: User;

  constructor(
    private route: ActivatedRoute,
    private notification: NotificationService,
    private authenticationService: AuthenticationService,
    public eventService: EventService,
    private liveAnnouncer: LiveAnnouncer,
    private translateService: TranslateService,
    private globalStorageService: GlobalStorageService
  ) {
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    const focusOnInput = this.eventService.focusOnInput;
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true && focusOnInput === false) {
      document.getElementById('searchBox').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true && focusOnInput === false) {
      document.getElementById('sort-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit4) === true && focusOnInput === false) {
      document.getElementById('comment-describer').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit5) === true && focusOnInput === false) {
      document.getElementById('switch-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true && focusOnInput === false) {
      this.announce();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true && focusOnInput === true) {
      document.getElementById('live-announcer-button').focus();
    }
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      document.getElementById('live-announcer-button').focus();
    }, 700);
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
    this.translateService.get('comment-page.a11y-keys-moderation').subscribe(msg => {
      this.liveAnnouncer.clear();
      this.liveAnnouncer.announce(msg, 'assertive');
    });
  }
}
