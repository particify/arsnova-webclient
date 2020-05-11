import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NotificationService } from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalStorageService, LocalStorageKey, MemoryStorageKey } from '../../../services/util/global-storage.service';

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
    this.translateService.use(this.globalStorageService.getLocalStorageItem(LocalStorageKey.LANGUAGE));
    const userId = this.authenticationService.getUser().id;
    this.initAnswer(userId);
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

  goToStats(contentId: string) {
    this.globalStorageService.setMemoryItem(MemoryStorageKey.LAST_CONTENT, contentId);
    this.router.navigate([`/participant/room/${this.shortId}/group/${this.contentGroupName}/statistics/${this.index + 1}`]);
  }

  submitAnswer() {
  }

  abstain($event) {
  }
}
