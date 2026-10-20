import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';

export interface PrioritizationItem {
  label: string;
  labelRendered?: string | null;
}

const STEP_SIZE = 10;

@Component({
  selector: 'app-content-prioritization-answer',
  imports: [CoreModule, RenderedTextComponent],
  templateUrl: './content-prioritization-answer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./content-prioritization-answer.component.scss'],
})
export class ContentPrioritizationAnswerComponent {
  readonly answerOptions = input.required<PrioritizationItem[]>();
  readonly assignablePoints = input.required<number>();
  readonly assignedPoints = model<number[]>([]);
  readonly disabled = input(false);
  readonly dynamicRendering = input(false);

  readonly stepSize = STEP_SIZE;

  readonly items = computed(() =>
    this.answerOptions().map((option, index) => ({
      label: option.label,
      labelRendered: option.labelRendered ?? undefined,
      points: this.pointsAt(index),
    }))
  );

  readonly pointsLeft = computed(
    () =>
      this.assignablePoints() -
      this.assignedPoints().reduce((sum, points) => sum + points, 0)
  );

  step(index: number, direction: -1 | 1) {
    this.setPoints(index, this.pointsAt(index) + STEP_SIZE * direction);
  }

  /**
   * Whole points only, since that is what the server stores. A value beyond the
   * budget is kept as typed, leaving it to the submit to report it.
   */
  setTypedPoints(index: number, value: string) {
    const points = Number.parseInt(value, 10);
    this.setPoints(index, Number.isNaN(points) ? 0 : points);
  }

  private setPoints(index: number, points: number) {
    this.assignedPoints.update((current) => {
      // One entry per item, however short the incoming array was.
      const next = this.answerOptions().map((_, i) => current[i] ?? 0);
      next[index] = points;
      return next;
    });
  }

  private pointsAt(index: number): number {
    return this.assignedPoints()[index] ?? 0;
  }
}
