import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { CommentSettings } from '../models/comment-settings';
import { CommentSettingsService } from '../services/http/comment-settings.service';

@Injectable()
export class CommentSettingsResolver implements Resolve<CommentSettings> {
  constructor(private commentSettingService: CommentSettingsService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<CommentSettings> {
    return this.commentSettingService.get(route.parent.data.room.id);
  }
}
