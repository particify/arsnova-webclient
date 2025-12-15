import { inject, Injectable } from '@angular/core';
import { EntityChangeNotification } from '@app/core/models/events/entity-change-notification';
import { RoomService } from '@app/core/services/http/room.service';
import { EventService } from '@app/core/services/util/event.service';
import { RoomStatsFragmentDoc } from '@gql/generated/graphql';
import { Apollo } from 'apollo-angular';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GraphqlEntityChangeHandler {
  private readonly apollo = inject(Apollo);
  private readonly eventService = inject(EventService);
  private readonly roomService = inject(RoomService);

  init() {
    this.eventService
      .on<EntityChangeNotification>('EntityChangeNotification')
      .pipe(
        filter(
          (e) =>
            e.payload.entityType === 'Room' && e.payload.changeType === 'UPDATE'
        )
      )
      .subscribe((e) => this.handleRoomUpdateEvent(e.payload.id));
    this.roomService
      .getCurrentRoomsMessageStream()
      .pipe(filter((msg) => !!msg.body.UserCountChanged))
      .subscribe((msg) =>
        this.updateCachedRoomActiveMemberCount(
          msg.roomId,
          msg.body.UserCountChanged.userCount
        )
      );
  }

  private handleRoomUpdateEvent(roomId: string) {
    for (const [query] of this.apollo.client.getObservableQueries().entries()) {
      if (
        query.queryName === 'RoomById' &&
        query.variables?.id?.replaceAll('-', '') === roomId
      ) {
        query.refetch();
      }
    }
  }

  private updateCachedRoomActiveMemberCount(roomId: string, count: number) {
    this.apollo.client.writeFragment({
      fragment: RoomStatsFragmentDoc,
      id: this.apollo.client.cache.identify({
        __typename: 'RoomStats',
        id: roomId,
      }),
      data: {
        id: roomId,
        activeMemberCount: count,
      },
    });
  }
}

export function graphqlEntityChangeHandlerInitializer(
  graphqlEntityChangeHandler: GraphqlEntityChangeHandler
) {
  graphqlEntityChangeHandler.init();
}
