import { Component, Input } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { LICENSES } from '@app/core/models/licenses';

@Component({
  selector: 'app-template-license',
  imports: [CoreModule],
  templateUrl: './template-license.component.html',
  styleUrls: ['./template-license.component.scss'],
})
export class TemplateLicenseComponent {
  @Input() ownerName?: string;
  @Input({ required: true }) license!: string;
  @Input() showLink = false;
  @Input() aiGenerated = false;

  LICENSES = LICENSES;
}
