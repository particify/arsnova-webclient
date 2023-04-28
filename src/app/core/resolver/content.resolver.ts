import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { Content } from '@app/core/models/content';
import { ContentService } from '@app/core/services/http/content.service';

@Injectable()
export class ContentResolver implements Resolve<Content> {
  constructor(private contentService: ContentService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Content> {
    return this.contentService.getContent(
      route.data.room.id,
      route.params['contentId']
    );
  }
}
