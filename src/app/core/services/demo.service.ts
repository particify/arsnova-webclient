import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { DemoRoomCreated } from '@app/core/models/events/demo-room-created';
import { RoomService } from './http/room.service';
import { EventService } from './util/event.service';
import { DuplicateDemoRoomGql } from '@gql/generated/graphql';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DemoService {
  private http = inject(HttpClient);
  private roomService = inject(RoomService);
  private eventService = inject(EventService);
  private duplicateDemoRoomGql = inject(DuplicateDemoRoomGql);

  createDemoRoom(): Observable<string> {
    return this.duplicateDemoRoomGql.mutate().pipe(
      map((r) => r.data?.duplicateDemoRoom),
      filter((room) => room !== undefined),
      switchMap((room) =>
        this.generateRandomData(room.id).pipe(map(() => room))
      ),
      tap((room) => {
        const event = new DemoRoomCreated(room.id, room.shortId);
        this.eventService.broadcast(event.type, event.payload);
      }),
      map((room) => room.shortId)
    );
  }

  private generateRandomData(roomId: string): Observable<void> {
    const connectionUrl = this.roomService.buildForeignUri(
      '/generate-random-data',
      roomId
    );
    return this.http
      .post<void>(connectionUrl, null)
      .pipe(
        catchError(this.roomService.handleError<void>(`generateRandomData`))
      );
  }
}
