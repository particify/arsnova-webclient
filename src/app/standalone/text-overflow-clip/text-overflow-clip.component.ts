import { Component, Input } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';

@Component({
  selector: 'app-text-overflow-clip',
  standalone: true,
  imports: [FlexModule],
  templateUrl: './text-overflow-clip.component.html',
})
export class TextOverflowClipComponent {
  @Input({ required: true }) text!: string;
}
