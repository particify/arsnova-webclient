import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { AbstractLiveFeedbackPageComponent } from '@app/common/abstract/abstract-live-feedback-page';
import { FeedbackMessageType } from '@app/core/models/messages/feedback-message-type';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { RoomService } from '@app/core/services/http/room.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { WsFeedbackService } from '@app/core/services/websockets/ws-feedback.service';
import { TranslocoService } from '@jsverse/transloco';
import { Message } from '@stomp/stompjs';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { debounceTime, fromEvent, take, takeUntil } from 'rxjs';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
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
  protected wsFeedbackService: WsFeedbackService;
  protected feedbackService: FeedbackService;
  protected roomService: RoomService;
  protected translateService: TranslocoService;
  protected announceService: AnnounceService;
  protected globalStorageService: GlobalStorageService;
  protected focusModeService = inject(FocusModeService);
  protected hotkeyService = inject(HotkeyService);
  protected presentationService = inject(PresentationService);
  private eventService = inject(EventService);

  // Route data input below
  @Input() showAnswerCount?: boolean;
  private hotkeyRefs: symbol[] = [];

  controlBarVisible = true;

  constructor() {
    const wsFeedbackService = inject(WsFeedbackService);
    const feedbackService = inject(FeedbackService);
    const roomService = inject(RoomService);
    const translateService = inject(TranslocoService);
    const announceService = inject(AnnounceService);
    const globalStorageService = inject(GlobalStorageService);

    super(
      wsFeedbackService,
      feedbackService,
      roomService,
      translateService,
      announceService,
      globalStorageService
    );

    this.wsFeedbackService = wsFeedbackService;
    this.feedbackService = feedbackService;
    this.roomService = roomService;
    this.translateService = translateService;
    this.announceService = announceService;
    this.globalStorageService = globalStorageService;
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
    this.focusModeService.updateFeedbackState(this.room, !this.isClosed);
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
