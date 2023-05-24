import { Component } from '@angular/core';
import { LanguageService } from '@app/core/services/util/language.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-creator-page',
  templateUrl: './creator-page.component.html',
  styleUrls: ['../common/styles/room-page.scss'],
})
export class CreatorPageComponent {
  constructor(
    protected translateService: TranslateService,
    protected langService: LanguageService
  ) {
    langService.langEmitter.subscribe((lang) => {
      translateService.use(lang);
    });
  }
}
