import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { Subject, takeUntil, timer } from 'rxjs';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ServerTimeService } from '@app/core/services/util/server-time.service';

const TIMER_UPDATE_INTERVAL = 1000;
const DELAY_BUFFER = 250;

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CoreModule],
  styleUrl: './countdown-timer.component.scss',
  templateUrl: './countdown-timer.component.html',
})
export class CountdownTimerComponent implements OnInit, OnDestroy {
  @Input({ required: true }) endDate!: Date;
  @Input() showIcon = false;
  @Input() layout = 'row';
  @Input() borderRadius = 0;
  @Input() fontSize?: string;
  @Output() finished = new EventEmitter<void>();
  totalTime = 0;
  timeLeft = 0;

  protected timerFinished$ = new Subject<void>();

  constructor(private serverTimeService: ServerTimeService) {}

  ngOnInit(): void {
    this.endDate.setTime(this.endDate.getTime() - DELAY_BUFFER);
    timer(0, TIMER_UPDATE_INTERVAL)
      .pipe(takeUntil(this.timerFinished$))
      .subscribe(() => {
        this.setTimeLeft();
      });
  }

  ngOnDestroy(): void {
    this.finishTimer();
  }

  private finishTimer(): void {
    this.finished.emit();
    this.timerFinished$.next();
  }

  private setTimeLeft(): void {
    const now = new Date();
    dayjs.extend(relativeTime);
    this.timeLeft =
      Math.round(
        dayjs(this.endDate).diff(now) / 1000 -
          this.serverTimeService.averageOffset / 1000
      ) * 1000;
    if (!this.timeLeft) {
      this.finishTimer();
      return;
    }
    if (!this.totalTime) {
      this.totalTime = this.timeLeft;
    }
  }

  getTime() {
    if (this.timeLeft) {
      return dayjs(this.timeLeft).format('mm:ss');
    }
  }
}
