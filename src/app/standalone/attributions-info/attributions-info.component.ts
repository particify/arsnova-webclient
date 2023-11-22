import { Component, Input } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { Content } from '@app/core/models/content';
import { ContentLicenseAttribution } from '@app/core/models/content-license-attribution';
import { LICENSES } from '@app/core/models/licenses';

@Component({
  selector: 'app-attributions-info',
  standalone: true,
  imports: [CoreModule],
  templateUrl: './attributions-info.component.html',
})
export class AttributionsInfoComponent {
  @Input() attributions: ContentLicenseAttribution[];
  @Input() contents: Content[];

  LICENSES = LICENSES;

  getContentIndex(contentId: string): number {
    return this.contents.map((c) => c.id).indexOf(contentId);
  }
}
