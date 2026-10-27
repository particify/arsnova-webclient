import { Component, input } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { TemplateLicenseFragment } from '@gql/generated/graphql';

@Component({
  selector: 'app-template-license',
  imports: [CoreModule],
  templateUrl: './template-license.component.html',
  styleUrls: ['./template-license.component.scss'],
})
export class TemplateLicenseComponent {
  readonly ownerName = input<string | null>();
  readonly license = input.required<TemplateLicenseFragment>();
  readonly showLink = input(false);
  readonly aiGenerated = input(false);
}
