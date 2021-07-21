import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Room } from '../models/room';
import { ApiConfigService } from './http/api-config.service';
import { RoomService } from './http/room.service';

@Injectable()
export class DemoService {
  constructor(
    private apiConfigService: ApiConfigService,
    private roomService: RoomService
  ) {}

  createDemoRoom(): Observable<Room> {
    return this.apiConfigService.getApiConfig$().pipe(mergeMap(config => {
      const originalDemoShortId = config.ui.demo;
      return this.roomService.duplicateRoom(`~${originalDemoShortId}`);
    }));
  }
}
