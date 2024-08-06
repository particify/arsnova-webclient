import { Component, Input } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { LanguageContextDirective } from '@app/core/directives/language-context.directive';
import { CopyUrlComponent } from '@app/standalone/copy-url/copy-url.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { TextOverflowClipComponent } from '@app/standalone/text-overflow-clip/text-overflow-clip.component';

@Component({
  standalone: true,
  imports: [
    CoreModule,
    CopyUrlComponent,
    RenderedTextComponent,
    TextOverflowClipComponent,
    LanguageContextDirective,
  ],
  selector: 'app-room-overview-header',
  templateUrl: './room-overview-header.component.html',
  styleUrls: ['./room-overview-header.component.scss'],
})
export class RoomOverviewHeaderComponent {
  @Input({ required: true }) name!: string;
  @Input({ required: true }) shortId!: string;
  @Input({ required: true }) roomJoinUrl!: string;
  @Input() description?: string;
  @Input() renderedDescription?: string;
}
