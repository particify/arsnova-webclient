import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@ngneat/transloco';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { CommentService } from '@app/core/services/http/comment.service';
import { EventService } from '@app/core/services/util/event.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentGroup } from '@app/core/models/content-group';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { AbstractRoomOverviewPage } from '@app/common/abstract/abstract-room-overview-page';
import { ContentGroupTemplateSelectionComponent } from '@app/creator/_dialogs/content-group-template-selection/content-group-template-selection.component';
@Component({
  selector: 'app-creator-overview',
  templateUrl: './room-overview-page.component.html',
  styleUrls: ['./room-overview-page.component.scss'],
})
export class RoomOverviewPageComponent
  extends AbstractRoomOverviewPage
  implements OnInit, OnDestroy
{
  isModerator = false;

  constructor(
    protected roomStatsService: RoomStatsService,
    protected commentService: CommentService,
    protected contentGroupService: ContentGroupService,
    protected wsCommentService: WsCommentService,
    protected eventService: EventService,
    protected notificationService: NotificationService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected translateService: TranslocoService,
    protected dialogService: DialogService,
    protected globalStorageService: GlobalStorageService,
    protected routingService: RoutingService
  ) {
    super(
      roomStatsService,
      commentService,
      contentGroupService,
      wsCommentService,
      eventService
    );
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.route.data.subscribe((data) => {
      this.role = data.viewRole;
      this.initializeRoom(data.room, 'ModeratorDataChanged', true);
      this.isModerator = data.userRole === UserRole.MODERATOR;
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  setGroupDataInGlobalStorage() {
    this.globalStorageService.setItem(
      STORAGE_KEYS.CONTENT_GROUPS,
      this.contentGroups.map((cg) => cg.name)
    );
  }

  openCreateContentGroupDialog() {
    this.dialogService
      .openContentGroupCreationDialog(this.room.id)
      .afterClosed()
      .subscribe((name) => {
        if (name) {
          this.router.navigate(['edit', this.room.shortId, 'series', name]);
        }
      });
  }

  openTemplateSelectionDialog() {
    this.dialogService.openDialog(ContentGroupTemplateSelectionComponent, {
      panelClass: 'big-dialog-panel',
      data: {
        roomId: this.room.id,
      },
    });
  }
}
