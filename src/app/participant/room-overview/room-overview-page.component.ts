import { AfterContentInit, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
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

@Component({
  selector: 'app-participant-overview',
  templateUrl: './room-overview-page.component.html',
  styleUrls: ['../../common/styles/room-overview.scss'],
})
export class RoomOverviewPageComponent
  extends AbstractRoomOverviewPage
  implements OnInit, OnDestroy, AfterContentInit
{
  surveyEnabled = false;
  commentsEnabled = false;

  constructor(
    protected roomStatsService: RoomStatsService,
    protected commentService: CommentService,
    protected contentGroupService: ContentGroupService,
    protected wsCommentService: WsCommentService,
    protected eventService: EventService,
    protected route: ActivatedRoute,
    protected translateService: TranslateService,
    protected globalStorageService: GlobalStorageService,
    protected feedbackService: FeedbackService,
    protected commentSettingsService: CommentSettingsService,
    protected contentPublishService: ContentPublishService
  ) {
    super(
      roomStatsService,
      commentService,
      contentGroupService,
      wsCommentService,
      eventService
    );
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      document.getElementById('live-announcer-button').focus();
    }, 700);
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.route.data.subscribe((data) => {
      this.role = data.viewRole;
      this.initializeRoom(data.room, 'PublicDataChanged');
      this.getFeedback();
      this.commentsEnabled = !data.commentSettings.disabled;
    });
    this.translateService.use(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.commentSettingsService
      .getSettingsStream()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((settings) => {
        this.commentsEnabled = !settings.disabled;
      });
  }

  getFeedback() {
    this.surveyEnabled = !this.room.settings['feedbackLocked'];
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
