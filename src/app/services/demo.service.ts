import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Room } from '../models/room';
import { ApiConfigService } from './http/api-config.service';
import { RoomService } from './http/room.service';

@Injectable()
export class DemoService {
  constructor(
    private apiConfigService: ApiConfigService,
    private roomService: RoomService,
    private translateService: TranslateService
  ) {}

  createDemoRoom(): Observable<Room> {
    return this.getLocalizedDemoRoomId().pipe(mergeMap(shortId => {
      return this.roomService.duplicateRoom(`~${shortId}`);
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
