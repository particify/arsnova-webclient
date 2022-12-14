import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import { RoomService } from '../../../services/http/room.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomOverviewComponent } from '../../shared/room-overview/room-overview.component';
import { Location } from '@angular/common';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '../../../services/util/notification.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { WsCommentService } from '../../../services/websockets/ws-comment.service';
import { CommentService } from '../../../services/http/comment.service';
import { EventService } from '../../../services/util/event.service';
import { ContentService } from '../../../services/http/content.service';
import { DialogService } from '../../../services/util/dialog.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '../../../services/util/global-storage.service';
import { UserRole } from '../../../models/user-roles.enum';
import { ContentGroupService } from '../../../services/http/content-group.service';
import { ContentGroup } from '../../../models/content-group';
import { RoomStatsService } from '../../../services/http/room-stats.service';
@Component({
  selector: 'app-creator-overview',
  templateUrl: './creator-overview.component.html',
  styleUrls: ['./creator-overview.component.scss'],
})
export class CreatorOverviewComponent
  extends RoomOverviewComponent
  implements OnInit, OnDestroy, AfterContentInit
{
  target: Window;
  isModerator = false;

  constructor(
    protected roomService: RoomService,
    protected roomStatsService: RoomStatsService,
    protected contentGroupService: ContentGroupService,
    protected notificationService: NotificationService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected location: Location,
    public dialog: MatDialog,
    protected translateService: TranslateService,
    protected langService: LanguageService,
    protected wsCommentService: WsCommentService,
    protected commentService: CommentService,
    public eventService: EventService,
    protected contentService: ContentService,
    private dialogService: DialogService,
    protected globalStorageService: GlobalStorageService
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
    this.translateService.use(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.route.data.subscribe((data) => {
      this.initializeRoom(data.room, data.userRole, data.viewRole);
      this.isModerator = data.userRole === UserRole.EXECUTIVE_MODERATOR;
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  afterRoomLoadHook() {
    this.subscribeCommentStream();
  }

  afterGroupsLoadHook() {
    this.prepareAttachmentData(UserRole.CREATOR);
    this.isLoading = false;
    this.globalStorageService.setItem(
      STORAGE_KEYS.CONTENT_GROUPS,
      this.contentGroups.map((cg) => cg.name)
    );
  }

  openCreateContentGroupDialog() {
    this.dialogService
      .openContentGroupCreationDialog()
      .afterClosed()
      .subscribe((name) => {
        if (name) {
          const newGroup = new ContentGroup();
          newGroup.roomId = this.room.id;
          newGroup.name = name;
          this.contentGroupService.post(newGroup).subscribe(() => {
            this.translateService
              .get('room-page.content-group-created')
              .subscribe((msg) => {
                this.notificationService.showAdvanced(
                  msg,
                  AdvancedSnackBarTypes.SUCCESS
                );
              });
            this.router.navigate(['edit', this.room.shortId, 'series', name]);
          });
        }
      });
  }
}
