import { Component, input } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { ExtensionPointComponent } from '@projects/extension-point/src/public-api';
import { HintComponent } from '@app/standalone/hint/hint.component';
import { SplitShortIdPipe } from '@app/core/pipes/split-short-id.pipe';
import { HintType } from '@app/core/models/hint-type.enum';
import { TranslocoPipe } from '@jsverse/transloco';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-room-info-component',
  imports: [
    MatCardModule,
    FlexLayoutModule,
    ExtensionPointComponent,
    HintComponent,
    SplitShortIdPipe,
    TranslocoPipe,
    RenderedTextComponent,
    NgClass,
  ],
  templateUrl: './room-info-component.component.html',
  styleUrl: './room-info-component.component.scss',
})
export class RoomInfoComponentComponent {
  name = input.required<string>();
  shortId = input.required<string>();
  description = input<string>();
  focusModeEnabled = input<boolean>(false);

  HintType = HintType;
}
