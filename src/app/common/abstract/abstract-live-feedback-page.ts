import { Component, EventEmitter, Input } from '@angular/core';
import { LiveFeedbackIcon } from '@app/core/models/live-feedback-icon.enum';
import { LiveFeedbackLabel } from '@app/core/models/live-feedback-label.enum';
import { LiveFeedbackSurveyLabel } from '@app/core/models/live-feedback-survey-label.enum';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { Room } from '@app/core/models/room';
import { FeedbackService } from '@app/core/services/http/feedback.service';
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
@Component({ template: '' })
export class AbstractLiveFeedbackPageComponent {
  // Route data input below
  @Input({ required: true }) room!: Room;

  destroyed$ = new Subject<void>();
  isLoading = true;

  isClosed = false;
  type: LiveFeedbackType = LiveFeedbackType.FEEDBACK;
  answerCount = 0;
  data: number[] = [];
  dataChanged = new EventEmitter<number[]>();

  LiveFeedbackType: typeof LiveFeedbackType = LiveFeedbackType;
  feedbackLabels = Object.values(LiveFeedbackLabel);
  feedbackIcons = Object.values(LiveFeedbackIcon);
  surveyLabels = Object.values(LiveFeedbackSurveyLabel);

  constructor(
    protected wsFeedbackService: WsFeedbackService,
    protected feedbackService: FeedbackService,
    protected roomService: RoomService,
    protected translateService: TranslocoService,
    protected announceService: AnnounceService,
    protected globalStorageService: GlobalStorageService
  ) {}

  initData() {
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.loadConfig(this.room);
    this.feedbackService.startSub(this.room.id);
    this.feedbackService.messageEvent
      .pipe(takeUntil(this.destroyed$))
      .subscribe((message) => {
        this.parseIncomingMessage(message);
      });
    this.feedbackService.get(this.room.id).subscribe((values: number[]) => {
      this.updateFeedback(values);
      this.isLoading = false;
      this.afterInitHook();
    });
  }

  protected loadConfig(room: Room) {
    this.room = room;
    this.isClosed = room.settings.feedbackLocked;
    this.type = this.feedbackService.getType(this.room);
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
