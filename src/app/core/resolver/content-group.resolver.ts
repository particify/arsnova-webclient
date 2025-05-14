import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { ContentGroup } from '@app/core/models/content-group';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContentGroupResolver implements Resolve<ContentGroup> {
  private contentGroupService = inject(ContentGroupService);

  resolve(route: ActivatedRouteSnapshot): Observable<ContentGroup> {
    return this.contentGroupService.getByRoomIdAndName(
      route.parent?.data.room.id,
      route.params['seriesName'],
      !!route.data.extendedView
    );
  }
}
