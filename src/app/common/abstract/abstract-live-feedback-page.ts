import { Component, EventEmitter, Input, inject } from '@angular/core';
import { LiveFeedbackIcon } from '@app/core/models/live-feedback-icon.enum';
import { LiveFeedbackLabel } from '@app/core/models/live-feedback-label.enum';
import { LiveFeedbackSurveyLabel } from '@app/core/models/live-feedback-survey-label.enum';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { Room } from '@app/core/models/room';
import { RoomSettings } from '@app/core/models/room-settings';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';
import { RoomService } from '@app/core/services/http/room.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { WsFeedbackService } from '@app/core/services/websockets/ws-feedback.service';
import { TranslocoService } from '@jsverse/transloco';
import { Message } from '@stomp/stompjs';
import { Subject, takeUntil } from 'rxjs';
@Component({
  template: '',
  standalone: false,
})
export class AbstractLiveFeedbackPageComponent {
  protected wsFeedbackService = inject(WsFeedbackService);
  protected feedbackService = inject(FeedbackService);
  protected roomService = inject(RoomService);
  protected translateService = inject(TranslocoService);
  protected announceService = inject(AnnounceService);
  protected globalStorageService = inject(GlobalStorageService);
  protected roomSettingsService = inject(RoomSettingsService);

  // Route data input below
  @Input({ required: true }) room!: Room;

  destroyed$ = new Subject<void>();
  isLoading = true;

  isEnabled = true;
  type: LiveFeedbackType = LiveFeedbackType.FEEDBACK;
  answerCount = 0;
  data: number[] = [];
  dataChanged = new EventEmitter<number[]>();

  LiveFeedbackType: typeof LiveFeedbackType = LiveFeedbackType;
  feedbackLabels = Object.values(LiveFeedbackLabel);
  feedbackIcons = Object.values(LiveFeedbackIcon);
  surveyLabels = Object.values(LiveFeedbackSurveyLabel);

  initData() {
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.loadConfig(true);
    this.feedbackService.startSub(this.room.id);
    this.feedbackService
      .getMessages()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((message) => {
        this.parseIncomingMessage(message);
      });
    this.feedbackService
      .get(this.room.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((values: number[]) => {
        this.updateFeedback(values);
        this.isLoading = false;
        this.afterInitHook();
      });
  }

  protected loadConfig(initial = false) {
    this.roomSettingsService
      .getByRoomId(this.room.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((settings) => {
        this.updateConfig(settings);
        if (initial) {
          this.roomSettingsService
            .getRoomSettingsStream(this.room.id, settings.id)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((settings) => {
              if (settings.surveyEnabled !== undefined) {
                this.isEnabled = settings.surveyEnabled;
              }
              if (settings.surveyType !== undefined) {
                this.type = settings.surveyType;
              }
            });
        }
      });
  }

  protected updateConfig(settings: RoomSettings) {
    this.isEnabled = settings.surveyEnabled;
    this.type = settings.surveyType;
  }

  protected updateFeedback(data: number[]) {
    this.answerCount = this.feedbackService.getAnswerSum(data);
    this.data = this.feedbackService.getBarData(data, this.answerCount);
    this.dataChanged.emit(this.data);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseIncomingMessage(message: Message) {
    // Implemented by extended classes
  }

  protected afterInitHook() {
    // Implemented by extended classes
  }
}
