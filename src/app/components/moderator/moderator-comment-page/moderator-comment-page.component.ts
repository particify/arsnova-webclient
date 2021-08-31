import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../services/util/notification.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { AnnounceService } from '../../../services/util/announce.service';
import { ClientAuthentication } from '../../../models/client-authentication';

@Component({
  selector: 'app-moderator-comment-page',
  templateUrl: './moderator-comment-page.component.html',
  styleUrls: ['./moderator-comment-page.component.scss']
})
export class ModeratorCommentPageComponent implements OnInit, AfterContentInit {

  auth: ClientAuthentication;

  constructor(
    private route: ActivatedRoute,
    private notification: NotificationService,
    private authenticationService: AuthenticationService,
    private announceService: AnnounceService
  ) {
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      document.getElementById('live-announcer-button').focus();
    }, 700);
  }

  ngOnInit(): void {
    this.authenticationService.getCurrentAuthentication()
      .subscribe(auth => this.auth = auth);
  }

  public announce() {
    this.announceService.announce('comment-page.a11y-shortcuts-moderation');
  }
}
