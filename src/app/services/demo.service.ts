import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { DemoRoomCreated } from '../models/events/demo-room-created';
import { Room } from '../models/room';
import { ApiConfigService } from './http/api-config.service';
import { RoomService } from './http/room.service';
import { EventService } from './util/event.service';

@Injectable()
export class DemoService {
  constructor(
    private apiConfigService: ApiConfigService,
    private roomService: RoomService,
    private translateService: TranslateService,
    private eventService: EventService
  ) {}

  createDemoRoom(): Observable<Room> {
    return this.getLocalizedDemoRoomId().pipe(
        mergeMap(shortId => {
          return this.roomService.duplicateRoom(`~${shortId}`, true);
        }),
        tap(room => this.roomService.generateRandomData(room.id).subscribe()),
        tap(room => {
          const event = new DemoRoomCreated(room.id, room.shortId);
          this.eventService.broadcast(event.type, event.payload);
        }));
  }

  getLocalizedDemoRoomId(): Observable<string> {
    const lang = this.translateService.currentLang;
    const fallbackLang = this.translateService.defaultLang;
    return this.apiConfigService.getApiConfig$().pipe(map(config => {
      let id = config.ui.demo?.[lang];
      id = id ?? config.ui.demo?.[fallbackLang];
      if (!id) {
        throw new Error('Demo room ID is not set.');
      }
      return id;
    }));
  }
}
