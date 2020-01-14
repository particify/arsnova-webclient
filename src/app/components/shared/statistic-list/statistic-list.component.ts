import { Component, Input, OnInit } from '@angular/core';
import { ContentGroup } from '../../../models/content-group';
import { ContentService } from '../../../services/http/content.service';
import { Content } from '../../../models/content';
import { ContentType } from '../../../models/content-type.enum';
import { AnswerOption } from '../../../models/answer-option';
import { ContentChoice } from '../../../models/content-choice';
import { Combination } from '../../../models/round-statistics';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { UserRole } from '../../../models/user-roles.enum';

export class ContentStatistic {
  content: Content;
  contentId: string;
  percent: number;
  counts: number;
  abstentions: number;

  constructor(content: Content, contentId: string, percent: number, counts: number, abstentions: number) {
    this.content = content;
    this.contentId = contentId;
    this.percent = percent;
    this.counts = counts;
    this.abstentions = abstentions;
  }
}

@Component({
  selector: 'app-list-statistic',
  templateUrl: './statistic-list.component.html',
  styleUrls: ['./statistic-list.component.scss']
})

export class StatisticListComponent implements OnInit {

  @Input() contentGroup: ContentGroup;
  contents: ContentChoice[] = [];
  displayedColumns: string[] = [];
  status = {
    good: 85,
    okay: 50,
    zero: 0,
    likert: -1,
    empty: -2
  };
  dataSource: ContentStatistic[];
  total = this.status.empty;
  totalP = 0;
  contentCounter = 0;
  roomId: number;
  baseUrl: string;
  deviceType = localStorage.getItem('deviceType');
  isLoading = true;

  constructor(private contentService: ContentService,
              private translateService: TranslateService,
              private router: Router,
              protected langService: LanguageService,
              protected route: ActivatedRoute,
              protected authService: AuthenticationService) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.roomId = params['shortId'];
    });
    this.translateService.use(localStorage.getItem('currentLang'));
    this.contentService.getContentsByIds(this.contentGroup.contentIds).subscribe(contents => {
      this.getData(contents);
    });
    this.getBaseUrl();
    if (this.deviceType === 'desktop') {
      this.displayedColumns = ['content', 'counts', 'abstentions', 'percentage'];
    } else {
      this.displayedColumns = ['content', 'counts', 'percentage'];
    }
  }

  getBaseUrl() {
    if (this.authService.getRole() === UserRole.CREATOR) {
      this.baseUrl = `/creator/room/${this.roomId}/statistics/`;
    } else {
      this.baseUrl = `/participant/room/${this.roomId}/statistics/`;
    }
  }

  goToStats(id: string) {
    this.router.navigate([`${this.baseUrl}${id}`]);
    sessionStorage.setItem('contentGroup', JSON.stringify(this.contentGroup));
  }

  getData(contents: Content[]) {
    this.filterContents(contents);
    const length = this.contents.length;
    let percent;
    this.dataSource = new Array<ContentStatistic>(length);
    for (let i = 0; i < length; i++) {
      this.dataSource[i] = new ContentStatistic(null, null, 0, 0, 0);
      this.dataSource[i].content = this.contents[i];
      if (this.contents[i].format === ContentType.CHOICE || this.contents[i].format === ContentType.BINARY
        || this.contents[i].format === ContentType.SCALE) {
        this.contentService.getAnswer(this.contents[i].id).subscribe(answer => {
          if (this.contents[i].format === ContentType.CHOICE) {
            percent = this.evaluateMultiple(this.contents[i].options, answer.roundStatistics[0].combinatedCounts);
            this.dataSource[i].counts = this.getMultipleCounts(answer.roundStatistics[0].combinatedCounts);
          } else {
            if (this.contents[i].format === ContentType.BINARY) {
              percent = this.evaluateSingle(this.contents[i].options, answer.roundStatistics[0].independentCounts);
            } else {
              percent = this.status.likert;
            }
            this.dataSource[i].counts = this.getSingleCounts(answer.roundStatistics[0].independentCounts);
          }
          this.dataSource[i].abstentions = answer.roundStatistics[0].abstentionCount;
          this.dataSource[i].percent = percent;
          this.dataSource[i].contentId = this.contents[i].id;
          if (percent > this.status.likert) {
            this.totalP += percent;
            this.total = this.totalP / this.contentCounter;
          } else if (this.total < 0) {
            this.total = this.status.empty;
          }
        });
      } else {
        this.dataSource[i].percent = this.status.empty;
      }
    }
    this.isLoading = false;
  }

  filterContents(contents: Content[]) {
    this.contents = contents.filter(c => {
      return c.format !== ContentType.TEXT;
    }) as ContentChoice[];
  }

  getSingleCounts(answers: number[]): number {
    let total = 0;
    const indLength = answers.length;
    for (let i = 0; i < indLength; i++) {
      total += answers[i];
    }
    return total;
  }

  getMultipleCounts(answers: Combination[]): number {
    let total = 0;
    if (answers) {
      const indLength = answers.length;
      for (let i = 0; i < indLength; i++) {
        total += answers[i].count;
      }
    }
    return total;
  }

  evaluateSingle(options: AnswerOption[], indCounts: number[]): number {
    let correctCounts = 0;
    let totalCounts = 0;
    const length = options.length;
    const correctIndex = new Array<number>();
    let res: number;
    for (let i = 0; i < length; i++) {
      if (options[i].points > 0) {
        correctIndex[0] = i;
      }
    }
    for (let i = 0; i < length; i++) {
      if (correctIndex.includes(i)) {
        correctCounts += indCounts[i];
      }
      totalCounts += indCounts[i];
    }
    if (totalCounts) {
      res = ((correctCounts / totalCounts) * 100);
      this.contentCounter++;
    } else {
      res = this.status.empty;
    }
    return res;
  }

  evaluateMultiple(options: AnswerOption[], combCounts: Combination[]): number {
    let combLength;
    if (combCounts) {
      combLength = combCounts.length;
    } else {
      return this.status.empty;
    }
    let correctCounts = 0;
    let totalCounts = 0;
    const optionsLength = options.length;
    const correctIndexes = new Array<number>();
    let res: number;
    let cic = 0;
    for (let i = 0; i < optionsLength; i++) {
      if (options[i].points > 0) {
        correctIndexes[cic] = i;
        cic++;
      }
    }
    for (let i = 0; i < combLength; i++) {
      if (combCounts[i].selectedChoiceIndexes.length === correctIndexes.length) {
        if (combCounts[i].selectedChoiceIndexes.toString() === correctIndexes.toString()) {
          correctCounts += combCounts[i].count;
        }
      }
      totalCounts += combCounts[i].count;
    }
    res = ((correctCounts / totalCounts) * 100);
    this.contentCounter++;
    return res;
  }
}
