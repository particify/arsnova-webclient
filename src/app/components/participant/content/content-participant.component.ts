import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NotificationService } from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';

@Component({
  selector: 'app-content-participant',
  templateUrl: './content-participant.component.html'
})
export class ContentParticipantComponent implements OnInit {


  @Input() index = 0;
  @Output() message = new EventEmitter<boolean>();

  alreadySent = false;
  isLoading = true;
  shortId: string;
  contentGroupName: string;
  flipped: boolean;
  extensionData: any;

  constructor(
    protected authenticationService: AuthenticationService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected langService: LanguageService,
    protected route: ActivatedRoute,
    protected globalStorageService: GlobalStorageService,
    protected router: Router
  ) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    this.authenticationService.getCurrentAuthentication()
        .subscribe(auth => this.initAnswer(auth.userId));
    this.route.params.subscribe(params => {
      this.shortId = params['shortId'];
      this.contentGroupName = params['contentGroup'];
    });
  }

  initAnswer(userId: string) {
  }

  sendStatusToParent() {
    this.message.emit(this.alreadySent);
  }

  goToStats() {
    this.flipped = !this.flipped;
    setTimeout(() => {
      document.getElementById('go-to-' + (this.flipped ? 'content' : 'stats')).focus();
    }, 300);
  }

  submitAnswer() {
  }

  abstain($event) {
  }

  setExtensionData(roomId: string, refId: string) {
    this.extensionData = {
      'roomId': roomId,
      'refType': 'content',
      'refId': refId,
      'detailedView': false
    };
  }
}
