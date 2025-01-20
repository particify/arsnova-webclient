import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import {
  provideTranslocoScope,
  TranslocoService,
  TranslocoPipe,
} from '@jsverse/transloco';
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
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { AbstractRoomOverviewPageComponent } from '@app/common/abstract/abstract-room-overview-page';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { HintType } from '@app/core/models/hint-type.enum';
import { DataChanged } from '@app/core/models/events/data-changed';
import { RoomStats } from '@app/core/models/room-stats';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { HintComponent } from '@app/standalone/hint/hint.component';
import { ContentGroupsComponent } from '@app/standalone/content-groups/content-groups.component';
import { RoomActionButtonComponent } from '@app/standalone/room-action-button/room-action-button.component';
import { RoomOverviewHeaderComponent } from '@app/standalone/room-overview-header/room-overview-header.component';
import { MatCard } from '@angular/material/card';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { AsyncPipe } from '@angular/common';
import { CoreModule } from '@app/core/core.module';
import { FlexModule } from '@angular/flex-layout';
import { CommentSettings } from '@app/core/models/comment-settings';
import { RoutingService } from '@app/core/services/util/routing.service';

@Component({
  selector: 'app-participant-overview',
  templateUrl: './room-overview-page.component.html',
  styleUrls: ['../../common/styles/room-overview.scss'],
  imports: [
    FlexModule,
    CoreModule,
    LoadingIndicatorComponent,
    MatCard,
    RoomOverviewHeaderComponent,
    RoomActionButtonComponent,
    ContentGroupsComponent,
    HintComponent,
    ExtensionPointModule,
    AsyncPipe,
    TranslocoPipe,
  ],
  providers: [provideTranslocoScope('participant')],
})
export class RoomOverviewPageComponent
  extends AbstractRoomOverviewPageComponent
  implements OnInit, OnDestroy
{
  // Route data input below
  @Input({ required: true }) commentSettings!: CommentSettings;

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
    protected translateService: TranslocoService,
    protected globalStorageService: GlobalStorageService,
    protected feedbackService: FeedbackService,
    protected commentSettingsService: CommentSettingsService,
    protected contentPublishService: ContentPublishService,
    protected focusModeService: FocusModeService,
    protected routingService: RoutingService
  ) {
    super(
      roomStatsService,
      commentService,
      contentGroupService,
      wsCommentService,
      eventService,
      routingService
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
    this.commentsEnabled = !this.commentSettings.disabled;
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
}
