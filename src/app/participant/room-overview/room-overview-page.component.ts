import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { CommentService } from '@app/core/services/http/comment.service';
import { EventService } from '@app/core/services/util/event.service';
import { Message } from '@stomp/stompjs';
import { takeUntil } from 'rxjs';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { FeedbackMessageType } from '@app/core/models/messages/feedback-message-type';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentGroup } from '@app/core/models/content-group';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { AbstractRoomOverviewPage } from '@app/common/abstract/abstract-room-overview-page';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { HintType } from '@app/core/models/hint-type.enum';
import { DataChanged } from '@app/core/models/events/data-changed';
import { RoomStats } from '@app/core/models/room-stats';

@Component({
  selector: 'app-participant-overview',
  templateUrl: './room-overview-page.component.html',
  styleUrls: ['../../common/styles/room-overview.scss'],
})
export class RoomOverviewPageComponent
  extends AbstractRoomOverviewPage
  implements OnInit, OnDestroy
{
  surveyEnabled = false;
  commentsEnabled = false;
  focusModeEnabled = false;
  HintType = HintType;

  constructor(
    protected roomStatsService: RoomStatsService,
    protected commentService: CommentService,
    protected contentGroupService: ContentGroupService,
    protected wsCommentService: WsCommentService,
    protected eventService: EventService,
    protected route: ActivatedRoute,
    protected translateService: TranslocoService,
    protected globalStorageService: GlobalStorageService,
    protected feedbackService: FeedbackService,
    protected commentSettingsService: CommentSettingsService,
    protected contentPublishService: ContentPublishService,
    protected focusModeService: FocusModeService
  ) {
    super(
      roomStatsService,
      commentService,
      contentGroupService,
      wsCommentService,
      eventService,
      route
    );
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.focusModeEnabled = this.room.focusModeEnabled;
    this.eventService
      .on<DataChanged<RoomStats>>('PublicDataChanged')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.initializeStats(false));
    this.initializeStats(false);
    this.subscribeCommentStream();
    this.getFeedback();
    this.commentsEnabled = !this.route.snapshot.data.commentSettings.disabled;
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.commentSettingsService
      .getSettingsStream()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((settings) => {
        this.commentsEnabled = !settings.disabled;
      });
    this.focusModeService
      .getFocusModeEnabled()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (focusModeEnabled) => (this.focusModeEnabled = focusModeEnabled)
      );
  }

  getFeedback() {
    this.surveyEnabled = !this.room.settings.feedbackLocked;
    this.feedbackService.startSub(this.room.id);
    this.feedbackService.messageEvent
      .pipe(takeUntil(this.destroyed$))
      .subscribe((message: Message) => {
        this.parseFeedbackMessage(message);
      });
  }

  setGroupDataInGlobalStorage() {
    if (
      this.contentGroups.length > 0 &&
      this.globalStorageService.getItem(STORAGE_KEYS.LAST_GROUP) === ''
    ) {
      this.globalStorageService.setItem(
        STORAGE_KEYS.LAST_GROUP,
        this.contentGroups[0].name
      );
    } else {
      if (this.contentGroups.length === 0) {
        this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, '');
      }
    }
  }

  parseFeedbackMessage(message: Message) {
    const msg = JSON.parse(message.body);
    if (msg.type === FeedbackMessageType.STARTED) {
      this.surveyEnabled = true;
    } else if (msg.type === FeedbackMessageType.STOPPED) {
      this.surveyEnabled = false;
    }
  }

  calcContentsInGroup(group: ContentGroup): number {
    return this.contentPublishService.filterPublishedIds(group).length;
  }
}
