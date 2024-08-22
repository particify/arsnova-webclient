import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { LanguageService } from '@app/core/services/util/language.service';
import { TranslocoService } from '@jsverse/transloco';
import { FooterComponent } from '@app/standalone/footer/footer.component';
import { NavBarComponent } from '@app/standalone/nav-bar/nav-bar.component';
import { NgClass } from '@angular/common';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import {
  MatDrawerContainer,
  MatDrawer,
  MatDrawerContent,
} from '@angular/material/sidenav';
import { FlexModule } from '@angular/flex-layout';

@Component({
  selector: 'app-participant-page',
  templateUrl: './participant-page.component.html',
  styleUrls: ['../common/styles/room-page.scss'],
  providers: [FocusModeService],
  standalone: true,
  imports: [
    FlexModule,
    MatDrawerContainer,
    ExtensionPointModule,
    MatDrawer,
    NavBarComponent,
    MatDrawerContent,
    NgClass,
    RouterOutlet,
    FooterComponent,
  ],
})
export class ParticipantPageComponent implements OnInit {
  focusModeEnabled = false;

  constructor(
    protected translateService: TranslocoService,
    protected langService: LanguageService,
    private focusModeService: FocusModeService,
    private route: ActivatedRoute
  ) {
    langService.langEmitter.subscribe((lang) => {
      translateService.setActiveLang(lang);
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
