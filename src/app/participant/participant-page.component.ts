import { Component, Input, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { RoutingService } from '@app/core/services/util/routing.service';
import { RoomSettings } from '@app/core/models/room-settings';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';
import { GlobalHintsComponent } from '@app/standalone/global-hints/global-hints.component';

@Component({
  selector: 'app-participant-page',
  templateUrl: './participant-page.component.html',
  styleUrls: ['../common/styles/room-page.scss'],
  providers: [FocusModeService],
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
    GlobalHintsComponent,
  ],
})
export class ParticipantPageComponent implements OnInit {
  protected translateService = inject(TranslocoService);
  protected langService = inject(LanguageService);
  private focusModeService = inject(FocusModeService);
  private routingService = inject(RoutingService);
  private roomSettingsService = inject(RoomSettingsService);

  focusModeEnabled = false;

  // Route data input below
  @Input({ required: true }) room!: Room;
  @Input({ required: true }) userRole!: UserRole;
  @Input({ required: true }) viewRole!: UserRole;

  roomSettings?: RoomSettings;

  constructor() {
    const translateService = this.translateService;
    const langService = this.langService;

    langService.langEmitter.subscribe((lang) => {
      translateService.setActiveLang(lang);
    });
  }

  ngOnInit(): void {
    const feature = this.routingService.getRoutingFeature();
    if (!feature) {
      return;
    }
    this.focusModeService.init(this.room.id, feature);
    this.focusModeService
      .getFocusModeEnabled()
      .subscribe(
        (focusModeEnabled) => (this.focusModeEnabled = focusModeEnabled)
      );
    this.roomSettingsService.getByRoomId(this.room.id).subscribe((settings) => {
      this.roomSettings = settings;
    });
  }
}
