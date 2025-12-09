import { inject, Injectable } from '@angular/core';
import { EntityChangeNotification } from '@app/core/models/events/entity-change-notification';
import { EventService } from '@app/core/services/util/event.service';
import { RoomByIdDocument, RoomStatsFragmentDoc } from '@gql/generated/graphql';
import { Apollo } from 'apollo-angular';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GraphqlEntityChangeHandler {
  private readonly apollo = inject(Apollo);
  private readonly eventService = inject(EventService);

  init() {
    this.eventService
      .on<EntityChangeNotification>('EntityChangeNotification')
      .pipe(
        filter(
          (e) =>
            e.payload.entityType === 'Room' && e.payload.changeType === 'UPDATE'
        )
      )
      .subscribe(() => this.handleRoomUpdateEvent());
  }

  private handleRoomUpdateEvent() {
    this.apollo.client.refetchQueries({
      include: [RoomByIdDocument],
    });
  }
}

export function graphqlEntityChangeHandlerInitializer(
  graphqlEntityChangeHandler: GraphqlEntityChangeHandler
) {
  graphqlEntityChangeHandler.init();
}
