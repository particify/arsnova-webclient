import { switchMap } from 'rxjs';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { EventService } from '@app/core/services/util/event.service';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
} from '@angular/core';
import { RoomByShortIdGql } from '@gql/generated/graphql';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Room } from '@app/core/models/room';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.Eager,
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
}
