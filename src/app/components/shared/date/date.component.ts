import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { Subject, takeUntil, timer } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

const TIME_UPDATE_INTERVAL = 60000;

@Component({
  selector: 'app-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss']
})
export class DateComponent implements OnInit, OnDestroy {

  @Input() timestamp: Date;
  @Input() responsive = false;

  refreshCounter = 0;
  destroyed$ = new Subject<void>();

  language: string;

  constructor(private translateService: TranslateService) {}

  ngOnInit(): void {
    this.language = this.translateService.currentLang;
    this.translateService.onLangChange.subscribe(language => {
      this.language = language.lang;
    })
    timer(TIME_UPDATE_INTERVAL, TIME_UPDATE_INTERVAL)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(() => this.refreshCounter++);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}
