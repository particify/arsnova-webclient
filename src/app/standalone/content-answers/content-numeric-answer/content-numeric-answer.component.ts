import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
  model,
} from '@angular/core';
import { CoreModule } from '@app/core/core.module';

@Component({
  selector: 'app-content-numeric-answer',
  imports: [CoreModule],
  templateUrl: './content-numeric-answer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './content-numeric-answer.component.scss',
})
export class ContentNumericAnswerComponent {
  readonly selectedNumber = model<number | undefined>(undefined);
  readonly minNumber = input.required<number>();
  readonly maxNumber = input.required<number>();
  readonly correctNumber = input<number | null | undefined>();
  readonly tolerance = input(0);
  readonly answered = input(false);
  readonly correctOptionsPublished = input(false);
  readonly disabled = input(false);

  readonly answerIndicatorVisible = computed(
    () =>
      this.answered() &&
      this.selectedNumber() !== undefined &&
      this.correctNumber() != null &&
      this.correctOptionsPublished()
  );

  /** Inclusive on both bounds, as on the server. */
  readonly correct = computed(() => {
    const correctNumber = this.correctNumber();
    const selectedNumber = this.selectedNumber();
    if (correctNumber == null || selectedNumber === undefined) {
      return false;
    }
    return (
      selectedNumber >= correctNumber - this.tolerance() &&
      selectedNumber <= correctNumber + this.tolerance()
    );
  });
}
