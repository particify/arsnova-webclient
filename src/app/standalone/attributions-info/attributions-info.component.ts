import { Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatListModule } from '@angular/material/list';
import { ContentGroup } from '@app/core/models/content-group';
import { LICENSES } from '@app/core/models/licenses';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentService } from '@app/core/services/http/content.service';
import { provideTranslocoScope, TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-attributions-info',
  imports: [TranslocoPipe, MatListModule],
  providers: [provideTranslocoScope('creator')],
  templateUrl: './attributions-info.component.html',
})
export class AttributionsInfoComponent {
  contentGroup = input.required<ContentGroup>();
  private contentService = inject(ContentService);
  private contentGroupService = inject(ContentGroupService);

  contents = rxResource({
    params: () => ({ contentGroup: this.contentGroup() }),
    stream: ({ params }) =>
      this.contentService.getContentsByIds(
        params.contentGroup.roomId,
        params.contentGroup.contentIds
      ),
  });

  attributions = rxResource({
    params: () => ({ contentGroup: this.contentGroup() }),
    stream: ({ params }) =>
      this.contentGroupService.getAttributions(
        params.contentGroup.roomId,
        params.contentGroup.id
      ),
  });

  LICENSES = LICENSES;

  getContentIndex(contentId: string): number {
    return (
      this.contents
        .value()
        ?.map((c) => c.id)
        .indexOf(contentId) ?? -1
    );
  }
}
