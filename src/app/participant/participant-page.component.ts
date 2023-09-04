import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { LanguageService } from '@app/core/services/util/language.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-participant-page',
  templateUrl: './participant-page.component.html',
  styleUrls: ['../common/styles/room-page.scss'],
  providers: [FocusModeService],
})
export class ParticipantPageComponent implements OnInit {
  focusModeEnabled: boolean;

  constructor(
    protected translateService: TranslateService,
    protected langService: LanguageService,
    private focusModeService: FocusModeService,
    private route: ActivatedRoute
  ) {
    langService.langEmitter.subscribe((lang) => {
      translateService.use(lang);
    });
  }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.focusModeService.init(
        data.room,
        this.route.snapshot.firstChild?.firstChild?.data.feature
      );
    });
    this.focusModeService
      .getFocusModeEnabled()
      .subscribe(
        (focusModeEnabled) => (this.focusModeEnabled = focusModeEnabled)
      );
  }
}
