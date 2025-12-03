import { switchMap } from 'rxjs';
import { ContentGroup } from '@app/core/models/content-group';
import { RoomStats } from '@app/core/models/room-stats';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { EventService } from '@app/core/services/util/event.service';
import {
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { RoomByShortIdGql } from '@gql/generated/graphql';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { Room } from '@app/core/models/room';

@Component({
  template: '',
  standalone: false,
})
export class AbstractRoomOverviewPageComponent {
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly roomStatsService = inject(RoomStatsService);
  protected readonly contentGroupService = inject(ContentGroupService);
  protected readonly eventService = inject(EventService);
  protected readonly roomByShortIdGql = inject(RoomByShortIdGql);

  // Route data input below
  readonly viewRole = input.required<UserRole>();
  readonly roomId = input.required<string>();
  readonly shortId = input.required<string>();
  // The old room structure is still used by child components.
  // Remove, once they have been updated to directly use GraphQL.
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly legacyRoom = input.required<Room>({ alias: 'room' });

  private readonly roomResult = toSignal(
    toObservable(this.shortId).pipe(
      switchMap((shortId) =>
        this.roomByShortIdGql.fetch({ variables: { shortId } })
      )
    )
  );
  readonly isLoading = computed(
    () => !this.roomResult()?.error && !this.roomResult()?.data?.roomByShortId
  );
  readonly room = computed(() => this.roomResult()?.data?.roomByShortId);
  readonly name = computed(() => this.room()?.name);
  readonly description = computed(() => this.room()?.description ?? '');
  readonly descriptionRendered = computed(
    () => this.room()?.descriptionRendered ?? ''
  );

  readonly isLoadingGroups = signal(true);
  contentGroups: ContentGroup[] = [];
  roomStats?: RoomStats;

  initializeStats(extendedStats: boolean) {
    this.roomStatsService
      .getStats(this.roomId(), extendedStats)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((roomStats) => {
        this.roomStats = roomStats;
        if (this.roomStats && this.roomStats.groupStats?.length > 0) {
          this.initializeGroups();
        } else {
          this.contentGroups = [];
          this.isLoadingGroups.set(false);
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
        { roomId: this.roomId() }
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
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
    this.isLoadingGroups.set(false);
    this.setGroupDataInGlobalStorage();
  }

  setGroupDataInGlobalStorage() {
    // Implemented in extended class
  }
}
