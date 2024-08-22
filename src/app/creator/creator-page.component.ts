import { Component } from '@angular/core';
import { LanguageService } from '@app/core/services/util/language.service';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-creator-page',
  templateUrl: './creator-page.component.html',
  styleUrls: ['../common/styles/room-page.scss'],
})
export class CreatorPageComponent {
  constructor(
    protected translateService: TranslocoService,
    protected langService: LanguageService
  ) {
    langService.langEmitter.subscribe((lang) => {
      translateService.setActiveLang(lang);
    });
  }
}
