import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NotificationService } from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { Answer } from '../../../models/answer';

@Component({
  template: ''
})
export abstract class ContentParticipantBaseComponent implements OnInit {

  @Output() answerChanged = new EventEmitter<Answer>();
  @Input() alreadySent: boolean;
  @Input() sendEvent: EventEmitter<string>;

  isLoading = true;
  shortId: string;
  contentGroupName: string;

  protected constructor(
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
    this.init();
    this.route.params.subscribe(params => {
      this.shortId = params['shortId'];
      this.contentGroupName = params['contentGroup'];
    });
    this.sendEvent.subscribe(send => {
      if (send === 'answer') {
        this.submitAnswer();
      } else {
        this.abstain();
      }
    });
  }

  init() {
  }

  sendStatusToParent(answer: Answer) {
    this.answerChanged.emit(answer);
  }

  submitAnswer() {
  }

  abstain() {
  }
}
