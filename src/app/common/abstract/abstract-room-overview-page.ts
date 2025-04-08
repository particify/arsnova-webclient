import { Subject, takeUntil } from 'rxjs';
import { Room } from '@app/core/models/room';
import { ContentGroup } from '@app/core/models/content-group';
import { RoomStats } from '@app/core/models/room-stats';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { EventService } from '@app/core/services/util/event.service';
import { Component, Input } from '@angular/core';

@Component({
  template: '',
  standalone: false,
})
export class AbstractRoomOverviewPageComponent {
  // Route data input below
  @Input({ required: true }) viewRole!: UserRole;
  @Input({ required: true }) room!: Room;
  destroyed$ = new Subject<void>();

  isLoading = true;

  contentGroups: ContentGroup[] = [];
  roomStats?: RoomStats;

  constructor(
    protected roomStatsService: RoomStatsService,
    protected contentGroupService: ContentGroupService,
    protected eventService: EventService
  ) {}

  initializeStats(extendedStats: boolean) {
    this.roomStatsService
      .getStats(this.room.id, extendedStats)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((roomStats) => {
        this.roomStats = roomStats;
        if (this.roomStats && this.roomStats.groupStats?.length > 0) {
          this.initializeGroups();
        } else {
          this.contentGroups = [];
          this.isLoading = false;
          this.afterGroupsLoadHook();
        }
      });
  }

  initializeGroups() {
    if (!this.roomStats) {
      return;
    }
    this.contentGroups.splice(0, this.contentGroups.length);
    this.contentGroupService
      .getByIds(
        this.roomStats.groupStats.map((stats) => stats.id),
        { roomId: this.room.id }
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe((groups) => {
        for (const group of groups) {
          this.contentGroups.push(group);
          if (this.contentGroups.length === this.roomStats?.groupStats.length) {
            this.contentGroups =
              this.contentGroupService.sortContentGroupsByName(
                this.contentGroups
              );
            this.afterGroupsLoadHook();
          }
        }
      });
  }

  afterGroupsLoadHook() {
    this.isLoading = false;
    this.setGroupDataInGlobalStorage();
  }

  setGroupDataInGlobalStorage() {
    // Implemented in extended class
  }
}
