import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../../services/http/content.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { ContentText } from '../../../models/content-text';
import { ContentAnswerService } from '../../../services/http/content-answer.service';
import { TextAnswer } from '../../../models/text-answer';

export class TextStatistic {
  answer: string;
  count: number;

  constructor(answer: string, count: number) {
    this.answer = answer;
    this.count = count;
  }
}

@Component({
  selector: 'app-statistic-text',
  templateUrl: './statistic-text.component.html',
  styleUrls: ['./statistic-text.component.scss']
})
export class StatisticTextComponent implements OnInit {

  @Input() content: ContentText;
  answers: TextStatistic[] = [];
  isLoading = true;

  constructor(protected route: ActivatedRoute,
              private contentService: ContentService,
              private contentAnswerService: ContentAnswerService,
              private translateService: TranslateService,
              protected langService: LanguageService) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }


  ngOnInit(): void {
    this.translateService.use(localStorage.getItem('currentLang'));
    this.contentAnswerService.getAnswers(this.content.id).subscribe(answers => {
      this.getData(answers);
      this.isLoading = false;
    });
  }

  getData(answers: TextAnswer[]) {
    const answersMap = new Map<string, number>();
    for (const answer of answers) {
      if (answersMap.has(answer.body.toLowerCase())) {
        const count = answersMap.get(answer.body.toLowerCase()) + 1;
        answersMap.set(answer.body.toLowerCase(), count);
      } else {
        answersMap.set(answer.body.toLowerCase(), 1);
      }
    }
    answersMap.forEach((value: number, key: string) => {
      this.answers.push(new TextStatistic(key, value));
    });
  }
}
