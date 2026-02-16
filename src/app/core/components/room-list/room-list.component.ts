import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { EventService } from '@app/core/services/util/event.service';
import { fromEvent, of } from 'rxjs';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  catchError,
  debounceTime,
  filter,
  first,
  map,
  take,
} from 'rxjs/operators';
import { RoomDeleted } from '@app/core/models/events/room-deleted';
import { RoutingService } from '@app/core/services/util/routing.service';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  DeleteRoomGql,
  RevokeRoomMembershipGql,
  RoomMembership,
  RoomMembershipsGql,
  RoomRole,
  RoomStats,
} from '@gql/generated/graphql';
import { CoreModule } from '@app/core/core.module';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { MatActionList } from '@angular/material/list';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';
import { TextOverflowClipComponent } from '@app/standalone/text-overflow-clip/text-overflow-clip.component';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { INDICATOR_SIZE } from '@app/standalone/loading-button/loading-button.component';

const ACTIVE_ROOM_THRESHOLD = 15;

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss'],
  imports: [
    CoreModule,
    ExtensionPointModule,
    LoadingIndicatorComponent,
    MatActionList,
    MatButton,
    MatCard,
    MatIcon,
    MatMenu,
    MatMenuTrigger,
    MatTooltip,
    NgClass,
    TextOverflowClipComponent,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomListComponent implements AfterViewInit, OnInit {
  private readonly dialogService = inject(DialogService);
  private readonly eventService = inject(EventService);
  private readonly notificationService = inject(NotificationService);
  private readonly roomMembershipsGql = inject(RoomMembershipsGql);
  private readonly router = inject(Router);
  private readonly routingService = inject(RoutingService);
  private readonly translateService = inject(TranslocoService);
  private readonly deleteRoom = inject(DeleteRoomGql);
  private readonly revokeMembership = inject(RevokeRoomMembershipGql);
  private readonly authenticationService = inject(AuthenticationService);

  private readonly searchInput =
    viewChild.required<ElementRef<HTMLInputElement>>('search');

  private readonly roomsQueryRef = this.roomMembershipsGql.watch({
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
  });
  private readonly roomsResult = toSignal(
    this.roomsQueryRef.valueChanges.pipe(
      filter((r) => r.dataState === 'complete'),
      map((r) => r.data.roomMemberships),
      catchError(() => of())
    )
  );
  readonly hasMore = computed(() => this.roomsResult()?.pageInfo.hasNextPage);
  readonly rooms = computed(
    () =>
      this.roomsResult()
        ?.edges?.filter((e) => !!e)
        .map((e) => e.node)
        .toSorted((a, b) => {
          const aAboveThreshold = this.isRoomActive(a.room.stats);
          const bAboveThreshold = this.isRoomActive(b.room.stats);
          return +bAboveThreshold - +aAboveThreshold;
        }) ?? []
  );
  readonly noRooms = toSignal(
    this.roomsQueryRef.valueChanges.pipe(
      filter((r) => r.dataState === 'complete'),
      first(),
      map((r) => r.data.roomMemberships?.edges?.length === 0),
      catchError(() => of(false))
    )
  );
  readonly isLoading = toSignal(
    this.roomsQueryRef.valueChanges.pipe(
      map((r) => r.loading),
      catchError(() => of(false))
    )
  );
  readonly errors = toSignal(
    this.roomsQueryRef.valueChanges.pipe(
      map((r) => r.error),
      catchError(() => of(true))
    )
  );
  readonly userId = toSignal(
    this.authenticationService.getCurrentAuthentication().pipe(
      first(),
      map((u) => u.userId)
    )
  );
  readonly isFetchMore = signal(false);
  readonly RoomRole = RoomRole;
  readonly roles = new Map<RoomRole, string>();
  readonly roomIds = signal<string[]>([]);
  readonly buttonIndicatorSize = INDICATOR_SIZE;

  ngOnInit() {
    const roleKeys = [
      'room-list.a11y-participant-role',
      'room-list.a11y-executive-moderator-role',
      'room-list.a11y-editor-role',
      'room-list.a11y-creator-role',
    ];
    const roles = [
      RoomRole.Participant,
      RoomRole.Moderator,
      RoomRole.Editor,
      RoomRole.Owner,
    ];
    this.translateService
      .selectTranslate(roleKeys)
      .pipe(take(1))
      .subscribe(() => {
        for (let i = 0; i < roleKeys.length; i++) {
          this.roles.set(
            roles[i],
            this.translateService.translate(roleKeys[i])
          );
        }
      });
  }

  ngAfterViewInit() {
    const searchEl = this.searchInput().nativeElement;
    fromEvent(searchEl, 'input')
      .pipe(debounceTime(250))
      .subscribe(() => this.filterRooms(searchEl.value ?? ''));
  }

  setCurrentRoom(shortId: string, role: RoomRole) {
    // this.updateLastAccess(shortId);
    this.router.navigate([this.roleToString(role), shortId]);
  }

  navToSettings(shortId: string) {
    this.router.navigate(['edit', shortId, 'settings']);
  }

  openDeleteRoomDialog(roomMembership: Omit<RoomMembership, 'lastActivityAt'>) {
    const isOwner = roomMembership.role === RoomRole.Owner;
    const dialogRef = this.dialogService.openDeleteDialog(
      isOwner ? 'room' : 'room-membership',
      'dialog.' +
        (isOwner ? 'really-delete-room' : 'really-cancel-room-membership'),
      roomMembership.room.name,
      undefined,
      () =>
        isOwner
          ? this.deleteRoom.mutate({
              variables: { id: roomMembership.room.id },
            })
          : this.revokeMembership.mutate({
              variables: { roomId: roomMembership.room.id },
            })
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.roomsQueryRef.refetch();
        let msg: string;
        if (isOwner) {
          msg = this.translateService.translate(
            'room-list.room-successfully-deleted'
          );
          const event = new RoomDeleted(roomMembership.room.id);
          this.eventService.broadcast(event.type, event.payload);
        } else {
          msg = this.translateService.translate(
            'room-list.room-successfully-removed'
          );
        }
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      }
    });
  }

  roleToString(role: RoomRole): string {
    return this.routingService.getRoleRoute(role);
  }

  fetchMore() {
    const cursor = this.roomsResult()?.pageInfo.endCursor;
    this.isFetchMore.set(true);
    this.roomsQueryRef.fetchMore({ variables: { cursor: cursor } });
  }

  filterRooms(search: string) {
    if (search.length > 0) {
      const shortId = this.toShortId(search);
      const query = shortId ? { shortId: shortId } : { name: search };
      this.roomsQueryRef.options.variables = { query };
    } else {
      this.roomsQueryRef.options.variables = {};
    }
    this.isFetchMore.set(false);
    this.roomsQueryRef.refetch();
  }

  toShortId(str: string) {
    str = str.replaceAll(/\s/g, '');
    return str.match(/[0-9]{8}/) ? str : undefined;
  }

  openCreateRoomDialog(): void {
    this.dialogService.openRoomCreateDialog();
  }

  protected isRoomActive(stats?: RoomStats | null): boolean {
    return (stats?.activeMemberCount ?? 0) >= ACTIVE_ROOM_THRESHOLD;
  }

  duplicateRoom(roomId: string, roomName: string) {
    const dialogRef = this.dialogService.openRoomCreateDialog(roomName, roomId);
    dialogRef.afterClosed().subscribe((name) => {
      if (name) {
        this.roomsQueryRef.refetch();
      }
    });
  }
}
