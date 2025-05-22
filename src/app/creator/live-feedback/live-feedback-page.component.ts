import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { AbstractLiveFeedbackPageComponent } from '@app/common/abstract/abstract-live-feedback-page';
import {
  HotkeyAction,
  HotkeyDirective,
} from '@app/core/directives/hotkey.directive';
import { FeedbackMessageType } from '@app/core/models/messages/feedback-message-type';
import { UserRole } from '@app/core/models/user-roles.enum';
import { FormService } from '@app/core/services/util/form.service';
import { Message } from '@stomp/stompjs';
import { takeUntil } from 'rxjs';
import { AutofocusDirective } from '@app/core/directives/autofocus.directive';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { BaseCardComponent } from '@app/standalone/base-card/base-card.component';
import { FlexModule } from '@angular/flex-layout';
import { LiveFeedbackComponent } from '@app/standalone/live-feedback/live-feedback.component';
import { NgClass, AsyncPipe } from '@angular/common';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatButton } from '@angular/material/button';
import { TrackInteractionDirective } from '@app/core/directives/track-interaction.directive';
import { DisableFormDirective } from '@app/core/directives/disable-form.directive';
import { AnswerCountComponent } from '@app/standalone/answer-count/answer-count.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-live-feedback-page',
  templateUrl: './live-feedback-page.component.html',
  styleUrls: ['./live-feedback-page.component.scss'],
  imports: [
    AutofocusDirective,
    LoadingIndicatorComponent,
    BaseCardComponent,
    FlexModule,
    LiveFeedbackComponent,
    NgClass,
    ExtendedModule,
    MatButton,
    TrackInteractionDirective,
    DisableFormDirective,
    HotkeyDirective,
    AnswerCountComponent,
    LoadingButtonComponent,
    AsyncPipe,
    A11yIntroPipe,
    TranslocoPipe,
  ],
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
    this.roomSettingsService
      .updateFeedbackType(this.room.id, this.type)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((settings) => {
        this.type = settings.surveyType;
        this.announceType();
        this.formService.enableForm();
      });
  }

  toggle() {
    this.formService.disableForm();
    this.roomSettingsService
      .updateSurveyEnabled(this.room.id, !this.isEnabled)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (settings) => {
          this.updateConfig(settings);
          if (!this.isEnabled) {
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
