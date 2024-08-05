import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NotificationService } from '@app/core/services/util/notification.service';
import { TranslocoService } from '@ngneat/transloco';
import { ActivatedRoute, Router } from '@angular/router';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { FormService } from '@app/core/services/util/form.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { AnswerResultType } from '@app/core/models/answer-result';

@Component({
  template: '',
})
export abstract class ContentParticipantBaseComponent
  extends FormComponent
  implements OnInit
{
  @Output() answerChanged = new EventEmitter<AnswerResultType>();
  @Input() isDisabled = false;
  @Input({ required: true }) sendEvent!: EventEmitter<string>;

  isLoading = true;
  shortId: string;
  contentGroupName: string;

  protected constructor(
    protected notificationService: NotificationService,
    protected translateService: TranslocoService,
    protected route: ActivatedRoute,
    protected globalStorageService: GlobalStorageService,
    protected router: Router,
    protected formService: FormService
  ) {
    super(formService);
    const params = route.snapshot.params;
    this.shortId = params['shortId'];
    this.contentGroupName = params['seriesName'];
  }

  ngOnInit() {
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.init();

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

  sendStatusToParent(answerResultType: AnswerResultType) {
    this.answerChanged.emit(answerResultType);
  }

  submitAnswer() {
    // Implementation in extended classes
  }

  abstain() {
    // Implementation in extended classes
  }
}
