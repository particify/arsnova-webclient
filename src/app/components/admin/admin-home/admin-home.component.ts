import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent {
  page: string;

  constructor(
    private route: ActivatedRoute,
    protected langService: LanguageService,
    protected translateService: TranslateService,
    protected globalStorageService: GlobalStorageService
  ) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    this.route.data.subscribe(data => this.changePage(data.page));
  }

  changePage(page: string) {
    this.page = page;
  }
}
