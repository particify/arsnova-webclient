import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';

@Component({
  selector: 'app-content-create-page',
  templateUrl: './content-create-page.component.html',
  styleUrls: ['./content-create-page.component.scss']
})
export class ContentCreatePageComponent implements OnInit {

  contentGroups: string[] = [];

  constructor(private translateService: TranslateService,
              protected langService: LanguageService) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.translateService.use(sessionStorage.getItem('currentLang'));
    this.getGroups();

  }

  getGroups(): void {
    this.contentGroups = JSON.parse(sessionStorage.getItem('contentGroups'));
  }
}
