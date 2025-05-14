import { Component, Input, inject } from '@angular/core';
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { LanguageService } from '@app/core/services/util/language.service';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-creator-page',
  templateUrl: './creator-page.component.html',
  styleUrls: ['../common/styles/room-page.scss'],
  standalone: false,
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
