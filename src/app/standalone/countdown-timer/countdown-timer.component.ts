import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { ServerTimeService } from '@app/core/services/util/server-time.service';
import dayjs from 'dayjs';

const TIMER_UPDATE_INTERVAL = 1000;
const DELAY_BUFFER = 250;

@Component({
  selector: 'app-countdown-timer',
  imports: [CoreModule],
  styleUrl: './countdown-timer.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './countdown-timer.component.html',
})
export class CountdownTimerComponent {
  private serverTimeService = inject(ServerTimeService);

  readonly endDate = input.required<Date>();
  readonly duration = input<number>();
  readonly showIcon = input(false);
  readonly layout = input('row');
  readonly borderRadius = input(0);
  readonly fontSize = input<string>();
  readonly bigFontSize = input(false);
  readonly showProgressBar = input(true);
  readonly finished = output<void>();

  private readonly deadline = computed(
    () => this.endDate().getTime() - DELAY_BUFFER
  );

  readonly timeLeft = linkedSignal({
    source: this.deadline,
    computation: () => this.remainingTime(),
  });

  readonly totalTime = linkedSignal({
    source: this.deadline,
    computation: () => this.remainingTime(),
  });

  readonly progressWidth = computed(() => {
    const duration = this.duration();
    return duration ? this.totalTime() / duration / 10 + '%' : '100%';
  });

  readonly timeLabel = computed(() =>
    this.timeLeft() > 0 ? dayjs(this.timeLeft()).format('mm:ss') : undefined
  );

  private readonly progressBar =
    viewChild<ElementRef<HTMLElement>>('progressBar');

  constructor() {
    effect((onCleanup) => {
      this.deadline();
      if (untracked(() => this.timeLeft()) <= 0) {
        return;
      }
      const timer = setInterval(() => {
        if (!this.tick()) {
          clearInterval(timer);
        }
      }, TIMER_UPDATE_INTERVAL);
      onCleanup(() => clearInterval(timer));
    });

    afterRenderEffect((onCleanup) => {
      this.deadline();
      const duration = this.totalTime();
      const element = this.progressBar()?.nativeElement;
      if (!element || duration <= 0) {
        return;
      }
      const animation = element.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-100%)' }],
        { duration, easing: 'linear', fill: 'forwards' }
      );
      onCleanup(() => animation.cancel());
    });
  }

  /** Returns whether the countdown is still running. */
  private tick(): boolean {
    this.timeLeft.set(this.remainingTime());
    if (this.timeLeft() > 0) {
      return true;
    }
    this.finished.emit();
    return false;
  }

  private remainingTime(): number {
    return (
      Math.round(
        (this.deadline() - Date.now() - this.serverTimeService.averageOffset) /
          1000
      ) * 1000
    );
  }
}
