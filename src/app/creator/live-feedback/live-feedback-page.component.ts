import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { AbstractLiveFeedbackPageComponent } from '@app/common/abstract/abstract-live-feedback-page';
import { HotkeyAction } from '@app/core/directives/hotkey.directive';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { FeedbackMessageType } from '@app/core/models/messages/feedback-message-type';
import { UserRole } from '@app/core/models/user-roles.enum';
import { FormService } from '@app/core/services/util/form.service';
import { Message } from '@stomp/stompjs';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-live-feedback-page',
  templateUrl: './live-feedback-page.component.html',
  styleUrls: ['./live-feedback-page.component.scss'],
  standalone: false,
})
export class LiveFeedbackPageComponent
  extends AbstractLiveFeedbackPageComponent
  implements OnInit, OnDestroy
{
  private formService = inject(FormService);

  // Route data input below
  @Input({ required: true }) userRole!: UserRole;

  toggleKey = '1';
  changeKey = '2';

  HotkeyAction = HotkeyAction;

  ngOnInit() {
    this.initData();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  changeType() {
    this.formService.disableForm();
    this.roomService
      .changeFeedbackType(this.room, this.type)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((room) => {
        this.type =
          room.extensions?.feedback?.type || LiveFeedbackType.FEEDBACK;
        this.announceType();
        this.formService.enableForm();
      });
  }

  toggle() {
    this.formService.disableForm();
    this.roomService
      .changeFeedbackLock(this.room, !this.isClosed)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (room) => {
          this.loadConfig(room);
          if (this.isClosed) {
            this.updateFeedback([0, 0, 0, 0]);
            this.wsFeedbackService.reset(this.room.id);
          }
          this.formService.enableForm();
        },
        () => {
          this.formService.enableForm();
        }
      );
  }

  isModerator(): boolean {
    return this.userRole === UserRole.MODERATOR;
  }

  private announceType() {
    const type = this.translateService.translate(
      'creator.survey.a11y-type-' + this.type.toLowerCase()
    );
    this.announceService.announce('creator.survey.a11y-selected-type', {
      type: type,
    });
  }

  protected parseIncomingMessage(message: Message) {
    const msg = JSON.parse(message.body);
    const payload = msg.payload;
    const type = msg.type;
    if (type === FeedbackMessageType.CHANGED) {
      this.updateFeedback(payload.values);
    }
  }
}
