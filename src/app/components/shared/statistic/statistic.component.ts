import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../../services/http/content.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { Content } from '../../../models/content';
import { StatisticChoiceComponent } from '../statistic-choice/statistic-choice.component';
import { ContentType } from '../../../models/content-type.enum';

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

  constructor(protected route: ActivatedRoute,
              private contentService: ContentService,
              private translateService: TranslateService,
              protected langService: LanguageService) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.translateService.use(localStorage.getItem('currentLang'));
    let contentId: string;
    this.route.params.subscribe(params => {
      contentId = params['contentId'];
    });
    this.contentService.getContent(contentId).subscribe(content => {
      this.content = content;
      if (this.content.format === ContentType.TEXT || this.content.format === ContentType.SCALE) {
        this.correctAnswers = false;
      }
      this.isLoading = false;
    });
  }

  switchAnswers() {
    if (this.showsCorrect === false) {
      this.choice.showCorrect();
      this.showsCorrect = true;
    } else {
      this.choice.showNormal();
      this.showsCorrect = false;
    }
  }
}
