import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../../services/http/content.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { Content } from '../../../models/content';
import { StatisticChoiceComponent } from '../statistic-choice/statistic-choice.component';
import { ContentType } from '../../../models/content-type.enum';
import { GlobalStorageService, LocalStorageKey } from '../../../services/util/global-storage.service';

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss']
})
export class StatisticComponent implements OnInit {

  @ViewChild(StatisticChoiceComponent) choice: StatisticChoiceComponent;

  content: Content;
  isLoading = true;
  showsCorrect = false;
  correctAnswers = true;

  constructor(
    protected route: ActivatedRoute,
    private contentService: ContentService,
    private translateService: TranslateService,
    protected langService: LanguageService,
    private globalStorageService: GlobalStorageService
  ) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.translateService.use(this.globalStorageService.getLocalStorageItem(LocalStorageKey.LANGUAGE));
    let contentId: string;
    this.route.data.subscribe(data => {
      this.content = data.content;
      if (this.content.format === ContentType.TEXT || this.content.format === ContentType.SCALE) {
        this.correctAnswers = false;
      }
      this.isLoading = false;
      setTimeout(() => {
        document.getElementById('message-button').focus();
      }, 700);
    });
  }

  switchAnswers(showsCorrect: boolean) {
    this.choice.toggleCorrect(!showsCorrect);
    this.showsCorrect = !showsCorrect;
  }
}
