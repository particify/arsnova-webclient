import { Component, Input, inject } from '@angular/core';
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { LanguageService } from '@app/core/services/util/language.service';
import { TranslocoService } from '@jsverse/transloco';
import { FlexModule } from '@angular/flex-layout';
import {
  MatDrawerContainer,
  MatDrawer,
  MatDrawerContent,
} from '@angular/material/sidenav';
import { ExtensionPointComponent } from '@projects/extension-point/src/lib/extension-point.component';
import { NavBarComponent } from '@app/standalone/nav-bar/nav-bar.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '@app/standalone/footer/footer.component';

@Component({
  selector: 'app-creator-page',
  templateUrl: './creator-page.component.html',
  styleUrls: ['../common/styles/room-page.scss'],
  imports: [
    FlexModule,
    MatDrawerContainer,
    ExtensionPointComponent,
    MatDrawer,
    NavBarComponent,
    MatDrawerContent,
    RouterOutlet,
    FooterComponent,
  ],
})
export class CreatorPageComponent {
  protected translateService = inject(TranslocoService);
  protected langService = inject(LanguageService);

  // Route data input below
  @Input({ required: true }) room!: Room;
  @Input({ required: true }) userRole!: UserRole;
  @Input({ required: true }) viewRole!: UserRole;

  constructor() {
    const translateService = this.translateService;
    const langService = this.langService;

    langService.langEmitter.subscribe((lang) => {
      translateService.setActiveLang(lang);
    });
  }
}
