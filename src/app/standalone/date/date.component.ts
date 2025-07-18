import { Component, Input, OnDestroy, inject } from '@angular/core';

import { Subject, takeUntil, timer } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { CoreModule } from '@app/core/core.module';

const TIME_UPDATE_INTERVAL = 60000;

@Component({
  imports: [CoreModule],
  selector: 'app-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss'],
})
export class DateComponent implements OnDestroy {
  private translateService = inject(TranslocoService);

  @Input({ required: true }) timestamp!: Date;

  refreshCounter = 0;
  destroyed$ = new Subject<void>();

  language: string;

  constructor() {
    this.language = this.translateService.getActiveLang();
    this.translateService.langChanges$.subscribe((lang) => {
      this.language = lang;
    });
    timer(TIME_UPDATE_INTERVAL, TIME_UPDATE_INTERVAL)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.refreshCounter++);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
