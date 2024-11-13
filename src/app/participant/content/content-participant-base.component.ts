import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NotificationService } from '@app/core/services/util/notification.service';
import { TranslocoService } from '@jsverse/transloco';
import { Router } from '@angular/router';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { FormService } from '@app/core/services/util/form.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { AnswerResultType } from '@app/core/models/answer-result';
import { Answer } from '@app/core/models/answer';

@Component({
  template: '',
})
export abstract class ContentParticipantBaseComponent
  extends FormComponent
  implements OnInit
{
  @Output() answerChanged = new EventEmitter<{
    answer?: Answer;
    answerResult: AnswerResultType;
  }>();
  @Input() isDisabled = false;
  @Input({ required: true }) sendEvent!: EventEmitter<string>;
  @Input() answer?: Answer;

  isLoading = true;

  protected constructor(
    protected notificationService: NotificationService,
    protected translateService: TranslocoService,
    protected globalStorageService: GlobalStorageService,
    protected router: Router,
    protected formService: FormService
  ) {
    super(formService);
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

  sendStatusToParent(answerResult: AnswerResultType) {
    this.answerChanged.emit({
      answer: this.answer,
      answerResult: answerResult,
    });
  }

  submitAnswer() {
    // Implementation in extended classes
  }

  abstain() {
    // Implementation in extended classes
  }
}
