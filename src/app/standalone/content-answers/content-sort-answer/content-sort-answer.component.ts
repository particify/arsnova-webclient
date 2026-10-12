import { DragDropModule } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
} from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { DragDropBaseComponent } from '@app/standalone/drag-drop-base/drag-drop-base.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';

export interface SortItem {
  label: string;
  labelRendered?: string | null;
}

@Component({
  selector: 'app-content-sort-answer',
  imports: [CoreModule, DragDropModule, RenderedTextComponent],
  templateUrl: './content-sort-answer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./content-sort-answer.component.scss'],
})
export class ContentSortAnswerComponent extends DragDropBaseComponent<SortItem> {
  readonly answerOptions = input.required<SortItem[]>();
  readonly disabled = input(false);
  readonly dynamicRendering = input(false);
  /** Unset leaves the list neutral, for the creator's preview. */
  readonly correct = input<boolean | undefined>(undefined);
  readonly reordered = output<SortItem[]>();

  constructor() {
    super();
    effect(() => {
      // The base class reorders this array in place, so the template renders
      // a copy rather than the input, which may be a cached object.
      this.dragDroplist = [...this.answerOptions()];
    });
  }

  override drop(previousIndex: number, currentIndex: number) {
    if (!this.disabled()) {
      super.drop(previousIndex, currentIndex);
    }
  }

  override moveAnswer(event: KeyboardEvent, answerIndex: number) {
    if (!this.disabled()) {
      super.moveAnswer(event, answerIndex);
    }
  }

  /** Covers dragging and the arrow keys alike. */
  override moveItem(currentIndex: number, nextIndex: number) {
    super.moveItem(currentIndex, nextIndex);
    // A copy, since the reorder left the bound array's identity untouched.
    this.reordered.emit([...this.dragDroplist]);
  }
}
