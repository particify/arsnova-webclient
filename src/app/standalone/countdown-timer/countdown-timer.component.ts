import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { takeUntil, timer } from 'rxjs';
import * as dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import { TranslocoService } from '@ngneat/transloco';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';

const TIMER_UPDATE_INTERVAL = 1000;

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CoreModule],
  templateUrl: './countdown-timer.component.html',
})
export class CountdownTimerComponent implements OnDestroy, OnInit {
  @Input() endDate = new Date();
  @Input() showIcon = false;
  @Input() showNotification = false;
  @Output() finished = new EventEmitter<void>();
  timeLeft?: string;

  constructor(
    private translateService: TranslocoService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.setTimeLeft();
    timer(TIMER_UPDATE_INTERVAL, TIMER_UPDATE_INTERVAL)
      .pipe(takeUntil(this.finished))
      .subscribe(() => this.setTimeLeft());
  }

  ngOnDestroy(): void {
    this.finishTimer();
  }

  private finishTimer(): void {
    this.finished.emit();
  }

  private getSeconds(date: Date): number {
    return Math.floor(date.getTime() / 1000);
  }

  private setTimeLeft(): void {
    const now = new Date();
    if (this.getSeconds(now) === this.getSeconds(this.endDate)) {
      this.timeLeft = undefined;
      this.finishTimer();
      if (this.showNotification) {
        const msg = this.translateService.translate('timer.time-is-up');
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      }
      return;
    }
    dayjs.extend(relativeTime);
    const timeLeft = dayjs(this.endDate).diff(now);
    this.timeLeft = dayjs(timeLeft).format('mm:ss');
  }
}
