import { Component, OnDestroy, OnInit } from '@angular/core';
import { UiState } from '@app/core/models/events/ui/ui-state.enum';
import { EventService } from '@app/core/services/util/event.service';
import { LanguageService } from '@app/core/services/util/language.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-participant-page',
  templateUrl: './participant-page.component.html',
  styleUrls: ['../common/styles/room-page.scss'],
})
export class ParticipantPageComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject<void>();

  hideNavigation = false;

  constructor(
    private eventService: EventService,
    protected translateService: TranslateService,
    protected langService: LanguageService
  ) {
    langService.langEmitter.subscribe((lang) => {
      translateService.use(lang);
    });
  }

  ngOnInit(): void {
    this.eventService
      .on<boolean>(UiState.NAV_BAR_VISIBLE)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((isVisible) => {
        this.hideNavigation = !isVisible;
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
