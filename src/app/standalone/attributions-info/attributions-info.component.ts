import { Component, Input } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { Content } from '@app/core/models/content';
import { ContentLicenseAttribution } from '@app/core/models/content-license-attribution';
import { LICENSES } from '@app/core/models/licenses';
import { provideTranslocoScope } from '@jsverse/transloco';

@Component({
  selector: 'app-attributions-info',
  imports: [CoreModule],
  providers: [provideTranslocoScope('creator')],
  templateUrl: './attributions-info.component.html',
})
export class AttributionsInfoComponent {
  @Input({ required: true }) attributions!: ContentLicenseAttribution[];
  @Input({ required: true }) contents!: Content[];

  LICENSES = LICENSES;

  getContentIndex(contentId: string): number {
    return this.contents.map((c) => c.id).indexOf(contentId);
  }
}
