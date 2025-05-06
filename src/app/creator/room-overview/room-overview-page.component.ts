import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { EventService } from '@app/core/services/util/event.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { AbstractRoomOverviewPageComponent } from '@app/common/abstract/abstract-room-overview-page';
import { DataChanged } from '@app/core/models/events/data-changed';
import { RoomStats } from '@app/core/models/room-stats';
import { takeUntil } from 'rxjs';
import { GroupType } from '@app/core/models/content-group';
import { HintType } from '@app/core/models/hint-type.enum';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentType } from '@app/core/models/content-type.enum';

@Component({
  selector: 'app-creator-overview',
  templateUrl: './room-overview-page.component.html',
  styleUrls: ['./room-overview-page.component.scss'],
  standalone: false,
})
export class RoomOverviewPageComponent
  extends AbstractRoomOverviewPageComponent
  implements OnInit, OnDestroy
{
  // Route data input below
  @Input({ required: true }) userRole!: UserRole;

  groupTypes: Map<GroupType, string>;
  groupContentFormatIcons: Map<GroupType, Map<ContentType, string>> = new Map();
  hintType = HintType.INFO;

  constructor(
    protected roomStatsService: RoomStatsService,
    protected contentGroupService: ContentGroupService,
    protected eventService: EventService,
    protected router: Router,
    protected translateService: TranslocoService,
    protected dialogService: DialogService,
    protected globalStorageService: GlobalStorageService,
    private contentService: ContentService
  ) {
    super(roomStatsService, contentGroupService, eventService);
    this.groupTypes = this.contentGroupService.getTypeIcons();
    this.groupTypes.forEach((value, key) => {
      const groupTypeIcons = new Map<ContentType, string>();
      this.contentService.getTypeIcons().forEach((icon, type) => {
        if (
          this.contentGroupService
            .getContentFormatsOfGroupType(key)
            .includes(type) &&
          type !== ContentType.SLIDE
        ) {
          groupTypeIcons.set(type, icon);
        }
      });
      this.groupContentFormatIcons.set(key, groupTypeIcons);
    });
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.eventService
      .on<DataChanged<RoomStats>>('ModeratorDataChanged')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.initializeStats(true));
    this.initializeStats(true);
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

  openCreateContentGroupDialog(type = GroupType.MIXED) {
    this.dialogService
      .openContentGroupCreationDialog(this.room.id, type)
      .afterClosed()
      .subscribe((name) => {
        if (name) {
          this.router.navigate(['edit', this.room.shortId, 'series', name]);
        }
      });
  }

  navigateToTemplateSelection() {
    this.router.navigate(['edit', this.room.shortId, 'templates']);
  }

  isModerator(): boolean {
    return this.userRole === UserRole.MODERATOR;
  }
}
