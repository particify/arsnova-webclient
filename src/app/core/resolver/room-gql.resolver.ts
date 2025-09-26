import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { Room } from '@app/core/models/room';
import { RoomService } from '@app/core/services/http/room.service';
import { JoinRoomGql } from '@gql/generated/graphql';
import { filter, map, tap } from 'rxjs';

export const roomGqlResolver: ResolveFn<Room> = (
  route: ActivatedRouteSnapshot
) => {
  const roomService = inject(RoomService);
  const shortId = route.params['shortId'];
  const room = inject(JoinRoomGql)
    .mutate({ shortId: shortId })
    .pipe(
      map((r) => r.data?.joinRoom.room),
      filter((roomData) => !!roomData),
      map((roomData) => Room.fromGql(roomData)),
      tap((room) => roomService.joinRoom(room))
    );
  return room;
};
