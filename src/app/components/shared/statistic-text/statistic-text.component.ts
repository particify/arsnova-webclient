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
    const answersMap = new Map<string, TextStatistic>();
    for (const answer of answers) {
      if (answersMap.has(answer.body.toLowerCase())) {
        const count = answersMap.get(answer.body.toLowerCase()).count + 1;
        answersMap.set(answer.body.toLowerCase(), new TextStatistic(answersMap.get(answer.body.toLowerCase()).answer, count));
      } else {
        answersMap.set(answer.body.toLowerCase(), new TextStatistic(answer.body, 1));
      }
    }
    answersMap.forEach((value: TextStatistic) => {
      this.answers.push(new TextStatistic(value.answer, value.count));
    });
    this.answers.sort((a, b) => {
      return a.count > b.count ? -1 : 1;
    });
  }
}
