import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { AbstractLiveFeedbackPageComponent } from '@app/common/abstract/abstract-live-feedback-page';
import { FeedbackMessageType } from '@app/core/models/messages/feedback-message-type';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { Message } from '@stomp/stompjs';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { debounceTime, fromEvent, take, takeUntil } from 'rxjs';
import { CoreModule } from '@app/core/core.module';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { AnswerCountComponent } from '@app/standalone/answer-count/answer-count.component';
import { LiveFeedbackComponent } from '@app/standalone/live-feedback/live-feedback.component';
import { EventService } from '@app/core/services/util/event.service';

@Component({
  selector: 'app-live-feedback-page',
  templateUrl: './live-feedback-page.component.html',
  styleUrls: ['./live-feedback-page.component.scss'],
  imports: [
    CoreModule,
    LoadingIndicatorComponent,
    LiveFeedbackComponent,
    AnswerCountComponent,
  ],
})
export class LiveFeedbackPageComponent
  extends AbstractLiveFeedbackPageComponent
  implements OnInit, OnDestroy
{
  protected focusModeService = inject(FocusModeService);
  protected hotkeyService = inject(HotkeyService);
  protected presentationService = inject(PresentationService);
  private eventService = inject(EventService);

  // Route data input below
  @Input() showAnswerCount?: boolean;
  private hotkeyRefs: symbol[] = [];

  controlBarVisible = true;

  ngOnInit() {
    this.initData();
    this.translateService
      .selectTranslate(
        this.isEnabled ? 'creator.survey.stop' : 'creator.survey.start'
      )
      .pipe(take(1))
      .subscribe((t) => {
        this.hotkeyService.registerHotkey(
          {
            key: ' ',
            action: () => this.toggle(),
            actionTitle: t,
          },
          this.hotkeyRefs
        );
      });
    this.translateService
      .selectTranslate('creator.survey.change-type')
      .pipe(take(1))
      .subscribe((t) => {
        this.hotkeyService.registerHotkey(
          {
            key: 'c',
            action: () => this.changeType(),
            actionTitle: t,
          },
          this.hotkeyRefs
        );
      });
    this.eventService
      .on<boolean>('ControlBarVisible')
      .subscribe((isVisible) => {
        this.controlBarVisible = isVisible;
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.hotkeyRefs.forEach((h) => this.hotkeyService.unregisterHotkey(h));
  }

  afterInitHook() {
    this.focusModeService.updateFeedbackState(this.isEnabled);
    setTimeout(() => {
      this.initScale();
    });
    fromEvent(window, 'resize')
      .pipe(debounceTime(100), takeUntil(this.destroyed$))
      .subscribe(() => {
        this.initScale();
      });
  }

  private initScale(): void {
    const scale = this.presentationService.getScale(0.8);
    const liveFeedback = document.getElementById('live-feedback');
    if (liveFeedback) {
      liveFeedback.style.transform = `scale(${scale})`;
    }
  }

  changeType() {
    this.roomSettingsService
      .updateFeedbackType(this.room.id, this.type)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((settings) => {
        this.type = settings.surveyType;
      });
  }

  toggle() {
    this.roomSettingsService
      .updateSurveyEnabled(this.room.id, !this.isEnabled)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((settings) => {
        this.updateConfig(settings);
        this.focusModeService.updateFeedbackState(settings.surveyEnabled);
        this.presentationService.updateFeedbackStarted(settings.surveyEnabled);
        if (settings.surveyEnabled) {
          this.updateFeedback([0, 0, 0, 0]);
          this.wsFeedbackService.reset(this.room.id);
        }
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
