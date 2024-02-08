import { Component, Input, OnChanges } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';

const INITIAL_SLICE_POSITION = 5;

@Component({
  selector: 'app-text-overflow-clip',
  standalone: true,
  imports: [FlexModule],
  templateUrl: './text-overflow-clip.component.html',
})
export class TextOverflowClipComponent implements OnChanges {
  @Input({ required: true }) text!: string;

  slicePosition = INITIAL_SLICE_POSITION;

  ngOnChanges(): void {
    this.slicePosition =
      this.text.charAt(this.text.length - this.slicePosition) !== ' '
        ? INITIAL_SLICE_POSITION
        : INITIAL_SLICE_POSITION + 1;
  }
}
