import { AfterContentInit, Component, OnInit } from '@angular/core';
import { Room } from '../../../models/room';
import { RoomOverviewComponent } from '../../shared/room-overview/room-overview.component';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { WsCommentService } from '../../../services/websockets/ws-comment.service';
import { CommentService } from '../../../services/http/comment.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { EventService } from '../../../services/util/event.service';
import { Message } from '@stomp/stompjs';
import { Subscription } from 'rxjs';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '../../../services/util/global-storage.service';
import { UserRole } from '../../../models/user-roles.enum';
import { FeedbackMessageType } from '../../../models/messages/feedback-message-type';
import { FeedbackService } from '../../../services/http/feedback.service';
import { ContentGroupService } from '../../../services/http/content-group.service';
import { ContentGroup } from '../../../models/content-group';
import { RoomStatsService } from '../../../services/http/room-stats.service';
import { CommentSettingsService } from '../../../services/http/comment-settings.service';
import { ContentPublishService } from '../../../services/util/content-publish.service';

@Component({
  selector: 'app-participant-overview',
  templateUrl: './participant-overview.component.html',
  styleUrls: ['./participant-overview.component.scss'],
})
export class ParticipantOverviewComponent
  extends RoomOverviewComponent
  implements OnInit, AfterContentInit
{
  room: Room;
  protected surveySub: Subscription;
  protected commentSettingsSub: Subscription;
  surveyEnabled = false;
  commentsEnabled = false;

  constructor(
    protected roomStatsService: RoomStatsService,
    protected contentGroupService: ContentGroupService,
    protected route: ActivatedRoute,
    protected translateService: TranslateService,
    protected langService: LanguageService,
    protected wsCommentService: WsCommentService,
    protected commentService: CommentService,
    protected authenticationService: AuthenticationService,
    public eventService: EventService,
    protected globalStorageService: GlobalStorageService,
    private feedbackService: FeedbackService,
    private commentSettingsService: CommentSettingsService,
    private contentPublishService: ContentPublishService
  ) {
    super(
      roomStatsService,
      contentGroupService,
      route,
      wsCommentService,
      commentService,
      eventService,
      translateService,
      globalStorageService
    );
    langService.langEmitter.subscribe((lang) => translateService.use(lang));
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      document.getElementById('live-announcer-button').focus();
    }, 700);
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.route.data.subscribe((data) => {
      this.initializeRoom(data.room, data.userRole, data.viewRole);
      this.commentsEnabled = !data.commentSettings.disabled;
    });
    this.translateService.use(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.commentSettingsSub = this.commentSettingsService
      .getSettingsStream()
      .subscribe((settings) => {
        this.commentsEnabled = !settings.disabled;
      });
  }

  unsubscribe() {
    if (this.surveySub) {
      this.surveySub.unsubscribe();
    }
    if (this.commentSettingsSub) {
      this.commentSettingsSub.unsubscribe();
    }
  }

  getFeedback() {
    this.surveyEnabled = !this.room.settings['feedbackLocked'];
    this.feedbackService.startSub(this.room.id);
    this.surveySub = this.feedbackService.messageEvent.subscribe(
      (message: Message) => {
        this.parseFeedbackMessage(message);
      }
    );
  }

  afterRoomLoadHook() {
    this.getFeedback();
    this.initRoomData();
  }

  initRoomData() {
    this.prepareAttachmentData(UserRole.PARTICIPANT);
    this.subscribeCommentStream();
  }

  afterGroupsLoadHook() {
    this.isLoading = false;
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
