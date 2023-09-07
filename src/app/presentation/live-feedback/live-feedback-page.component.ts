import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbstractLiveFeedbackPage } from '@app/common/abstract/abstract-live-feedback-page';
import { FeedbackMessageType } from '@app/core/models/messages/feedback-message-type';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { RoomService } from '@app/core/services/http/room.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { WsFeedbackService } from '@app/core/services/websockets/ws-feedback.service';
import { TranslocoService } from '@ngneat/transloco';
import { Message } from '@stomp/stompjs';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { take, takeUntil } from 'rxjs';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';

@Component({
  selector: 'app-live-feedback-page',
  templateUrl: './live-feedback-page.component.html',
  styleUrls: ['./live-feedback-page.component.scss'],
})
export class LiveFeedbackPageComponent
  extends AbstractLiveFeedbackPage
  implements OnInit, OnDestroy
{
  private hotkeyRefs: symbol[] = [];

  constructor(
    protected notificationService: NotificationService,
    protected wsFeedbackService: WsFeedbackService,
    protected feedbackService: FeedbackService,
    protected roomService: RoomService,
    protected translateService: TranslocoService,
    protected announceService: AnnounceService,
    protected globalStorageService: GlobalStorageService,
    protected route: ActivatedRoute,
    protected focusModeService: FocusModeService,
    protected hotkeyService: HotkeyService,
    protected presentationService: PresentationService
  ) {
    super(
      wsFeedbackService,
      feedbackService,
      roomService,
      translateService,
      announceService,
      globalStorageService,
      route
    );
  }

  ngOnInit() {
    this.initData();
    this.translateService
      .selectTranslate(
        this.isClosed ? 'creator.survey.start' : 'creator.survey.stop'
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
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.hotkeyRefs.forEach((h) => this.hotkeyService.unregisterHotkey(h));
  }

  afterInitHook() {
    this.focusModeService.updateFeedbackState(this.room, !this.isClosed);
    setTimeout(() => {
      const scale = Math.max(Math.min(innerWidth, 2100) / 1500, 1);
      const liveFeedback = document.getElementById('live-feedback');
      if (liveFeedback) {
        liveFeedback.style.transform = `scale(${scale})`;
      }
    });
  }

  changeType() {
    this.roomService
      .changeFeedbackType(this.room, this.type)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((room) => {
        this.type =
          room.extensions?.feedback?.type || LiveFeedbackType.FEEDBACK;
      });
  }

  toggle() {
    this.roomService
      .changeFeedbackLock(this.room, !this.isClosed)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((room) => {
        this.loadConfig(room);
        this.focusModeService.updateFeedbackState(this.room, !this.isClosed);
        this.presentationService.updateFeedbackStarted(!this.isClosed);
        if (this.isClosed) {
          this.updateFeedback([0, 0, 0, 0]);
          this.wsFeedbackService.reset(this.room.id);
        }
        const state = this.isClosed ? 'stopped' : 'started';
        this.translateService
          .selectTranslate('creator.survey.' + state)
          .pipe(take(1))
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              msg,
              state === 'started'
                ? AdvancedSnackBarTypes.SUCCESS
                : AdvancedSnackBarTypes.WARNING
            );
          });
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
