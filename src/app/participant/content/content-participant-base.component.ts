import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NotificationService } from '@app/core/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { Answer } from '@app/core/models/answer';

@Component({
  template: '',
})
export abstract class ContentParticipantBaseComponent implements OnInit {
  @Output() answerChanged = new EventEmitter<Answer>();
  @Input() alreadySent: boolean;
  @Input() sendEvent: EventEmitter<string>;

  isLoading = true;
  shortId: string;
  contentGroupName: string;

  protected constructor(
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected route: ActivatedRoute,
    protected globalStorageService: GlobalStorageService,
    protected router: Router
  ) {}

  ngOnInit() {
    this.translateService.use(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.init();
    const params = this.route.snapshot.params;
    this.shortId = params['shortId'];
    this.contentGroupName = params['seriesName'];
    this.sendEvent.subscribe((send) => {
      if (send === 'answer') {
        this.submitAnswer();
      } else {
        this.abstain();
      }
    });
  }

  init() {
    // Implementation in extended classes
  }

  sendStatusToParent(answer: Answer) {
    this.answerChanged.emit(answer);
  }

  submitAnswer() {
    // Implementation in extended classes
  }

  abstain() {
    // Implementation in extended classes
  }
}
