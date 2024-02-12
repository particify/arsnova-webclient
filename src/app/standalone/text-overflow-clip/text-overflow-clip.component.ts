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
    this.slicePosition = this.getSlicePosition();
  }

  private getSlicePosition(): number {
    const slicePositionIndex = this.text.length - INITIAL_SLICE_POSITION;
    return (
      INITIAL_SLICE_POSITION +
      (this.isSpaceAtPosition(slicePositionIndex)
        ? 1
        : this.isSpaceAtPosition(slicePositionIndex - 1)
          ? -1
          : 0)
    );
  }

  private isSpaceAtPosition(position: number): boolean {
    return this.text.charAt(position) === ' ';
  }
}
