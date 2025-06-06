import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { NotificationService } from '@app/core/services/util/notification.service';
import { TranslocoService } from '@jsverse/transloco';
import { Router } from '@angular/router';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { AnswerResultType } from '@app/core/models/answer-result';
import { Answer } from '@app/core/models/answer';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  template: '',
  standalone: false,
})
export abstract class ContentParticipantBaseComponent
  extends FormComponent
  implements OnInit
{
  protected notificationService = inject(NotificationService);
  protected translateService = inject(TranslocoService);
  protected globalStorageService = inject(GlobalStorageService);
  protected router = inject(Router);

  @Output() answerChanged = new EventEmitter<{
    answer?: Answer;
    answerResult: AnswerResultType;
  }>();
  @Input() isDisabled = false;
  @Input({ required: true }) answerSubmitted!: Observable<string>;
  @Input() answer?: Answer;

  isLoading = true;
  private destroyRef$ = inject(DestroyRef);

  ngOnInit() {
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.init();

    this.answerSubmitted
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((send) => {
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
