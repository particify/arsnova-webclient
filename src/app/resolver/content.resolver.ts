import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Content } from '../models/content';
import { ContentService } from '../services/http/content.service';

@Injectable()
export class ContentResolver implements Resolve<Content> {

  constructor(
    private contentService: ContentService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Content> {
    return this.contentService.getContent(route.data.room.id, route.params['contentId']);
  }
}
