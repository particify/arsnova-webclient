import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { Content } from '@app/core/models/content';
import { ContentService } from '@app/core/services/http/content.service';

@Injectable()
export class ContentResolver implements Resolve<Content> {
  private contentService = inject(ContentService);

  resolve(route: ActivatedRouteSnapshot): Observable<Content> {
    return this.contentService.getContent(
      route.parent?.data.room.id,
      route.params.contentId ??
        route.parent?.data.contentGroup.contentIds[
          route.params['contentIndex'] - 1
        ],
      !!route.data.extendedView
    );
  }
}
