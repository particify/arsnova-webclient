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
import { ContentAnswerService } from '../../../services/http/content-answer.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { AdvancedSnackBarTypes, NotificationService } from '../../../services/util/notification.service';

export enum StatisticType {
  CHOICE = 'C',
  SURVEY = 'S',
  TEXT = 'T',
  SLIDE = 'I',
  FLASHCARD = 'F'
}

export class ContentStatistic {
  content: Content;
  type: StatisticType;
  percent: number;
  counts: number;
  abstentions: number;
  round: number;

  constructor(content: Content, type: StatisticType, percent: number, counts: number, abstentions: number, round: number) {
    this.content = content;
    this.type = type;
    this.percent = percent;
    this.counts = counts;
    this.abstentions = abstentions;
    this.round = round;
  }
}

@Component({
  selector: 'app-list-statistic',
  templateUrl: './statistic-list.component.html',
  styleUrls: ['./statistic-list.component.scss']
})

export class StatisticListComponent implements OnInit {

  @Input() contentGroup: ContentGroup;
  displayedColumns: string[] = [];
  status = {
    good: 85,
    okay: 50,
    zero: 0,
    empty: -1
  };
  types: typeof StatisticType = StatisticType;
  dataSource: ContentStatistic[];
  total = this.status.empty;
  totalP = 0;
  contentCounter = 0;
  shortId: number;
  deviceType: string;
  isLoading = true;
  statisticsAdded;
  statsLength: number;
  multipleRounds = false;

  constructor(
    private contentService: ContentService,
    private contentAnswerService: ContentAnswerService,
    private translateService: TranslateService,
    private router: Router,
    protected langService: LanguageService,
    protected route: ActivatedRoute,
    private globalStorageService: GlobalStorageService,
    private notificationService: NotificationService
  ) {
    this.deviceType = this.globalStorageService.getItem(STORAGE_KEYS.DEVICE_TYPE);
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.shortId = this.route.snapshot.params['shortId'];
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    this.getContents();
  }

  public getContents() {
    this.isLoading = true;
    this.contentService.getContentsByIds(this.contentGroup.roomId, this.contentGroup.contentIds, true).subscribe(contents => {
      this.getData(this.contentService.getSupportedContents(contents));
    });
  }

  goToStats(id: string) {
    const contentIndex = this.dataSource.map(d => d.content.id).indexOf(id);
    this.router.navigate(['edit', this.shortId, 'series', this.contentGroup.name, contentIndex + 1]);
    this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, this.contentGroup.name);
  }

  getData(contents: Content[]) {
    this.statisticsAdded = 0;
    this.statsLength = contents.length;
    this.dataSource = new Array<ContentStatistic>(this.statsLength);
    for (let i = 0; i < this.statsLength; i++) {
      const content = contents[i];
      const round = content.state.round;
      let percent = this.status.empty;
      let count = 0;
      let abstentions = 0;
      let type: StatisticType;
      switch (content.format) {
        case ContentType.TEXT:
          this.contentAnswerService.getAnswers(this.contentGroup.roomId, content.id).subscribe(answers => {
            abstentions = answers.filter(a => a.body === undefined).length;
            count = answers.length - abstentions;
            type = StatisticType.TEXT;
            this.addNewStatistic(i, new ContentStatistic(content, type, percent, count, abstentions, round));
          });
          break;
        case ContentType.SLIDE:
          abstentions = this.status.empty;
          count = this.status.empty;
          type = StatisticType.SLIDE;
          this.addNewStatistic(i, new ContentStatistic(content, type, percent, count, abstentions, round));
          break;
        case ContentType.FLASHCARD:
          abstentions = this.status.empty;
          count = this.status.empty;
          type = StatisticType.FLASHCARD;
          this.addNewStatistic(i, new ContentStatistic(content, type, percent, count, abstentions, round));
          break;
        default:
          this.contentService.getAnswer(this.contentGroup.roomId, content.id).subscribe(answer => {
            if (content.format === ContentType.CHOICE) {
              percent = this.evaluateMultiple((content as ContentChoice).correctOptionIndexes, answer.roundStatistics[round - 1].combinatedCounts);
              count = this.getMultipleCounts(answer.roundStatistics[round - 1].combinatedCounts);
            } else if (content.format === ContentType.SORT) {
              count = this.getMultipleCounts(answer.roundStatistics[round - 1].combinatedCounts);
              percent = this.evaluateSort((content as ContentChoice).options, answer.roundStatistics[round - 1].combinatedCounts, count);
            } else {
              if (content.format === ContentType.BINARY) {
                percent = this.evaluateSingle((content as ContentChoice).correctOptionIndexes, answer.roundStatistics[round - 1].independentCounts);
              }
              count = this.getSingleCounts(answer.roundStatistics[round - 1].independentCounts);
            }
            abstentions = answer.roundStatistics[round - 1].abstentionCount;
            if (percent > this.status.empty) {
              type = StatisticType.CHOICE;
              this.totalP += percent;
              this.total = this.totalP / this.contentCounter;
            } else {
              type = StatisticType.SURVEY;
            }
            this.addNewStatistic(i, new ContentStatistic(content, type, percent, count, abstentions, round));
          });
      }
      if (round > 1) {
        this.multipleRounds = true;
      }
    }
  }

  addNewStatistic(index: number, stats: ContentStatistic) {
    this.dataSource[index] = stats;
    this.checkIfLoadingFinished();
  }

  checkIfLoadingFinished() {
    this.statisticsAdded++;
    if (this.statisticsAdded === this.statsLength) {
      this.displayedColumns = ['content', 'round', 'counts', 'abstentions', 'percentage'];
      if (this.total < this.status.zero) {
        this.displayedColumns.pop();
      }
      if (!this.multipleRounds || this.deviceType !== 'desktop') {
        this.displayedColumns = this.displayedColumns.filter(d => d !== 'round');
      }
      if (this.dataSource.filter(d => d.abstentions > 0).length === 0 || this.deviceType !== 'desktop') {
        this.displayedColumns = this.displayedColumns.filter(d => d !== 'abstentions');
      }
      this.isLoading = false;
    }
  }

  getSingleCounts(answers: number[]): number {
    let total = 0;
    const indLength = answers?.length ?? 0;
    for (let i = 0; i < indLength; i++) {
      total += answers[i];
    }
    return total;
  }

  getMultipleCounts(answers: Combination[]): number {
    let total = 0;
    if (answers) {
      const indLength = answers?.length ?? 0;
      for (let i = 0; i < indLength; i++) {
        total += answers[i].count;
      }
    }
    return total;
  }

  checkIfSurvey(correctOptionIndexes: number[]): boolean {
    return correctOptionIndexes?.length > 0;
  }

  evaluateSingle(correctOptionIndexes: number[], indCounts: number[]): number {

    if (this.checkIfSurvey(correctOptionIndexes)) {
      let correctCounts = 0;
      let totalCounts = 0;
      let res: number;
      for (let i = 0; i < correctOptionIndexes.length; i++) {
        if (i === correctOptionIndexes[0]) {
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
    } else {
      return this.status.empty;
    }
  }

  evaluateMultiple(correctOptionIndexes: number[], combCounts?: Combination[]): number {
    if (combCounts && this.checkIfSurvey(correctOptionIndexes)) {
      let correctCounts = 0;
      let totalCounts = 0;
      for (let i = 0; i < combCounts.length; i++) {
        const counts = combCounts[i].count;
        if (correctOptionIndexes.sort().toString() === combCounts[i].selectedChoiceIndexes.sort().toString()) {
          correctCounts = counts;
        }
        totalCounts += counts;
      }
      this.contentCounter++;
      return (correctCounts / totalCounts) * 100;
    } else {
      return this.status.empty;
    }
  }

  evaluateSort(options: AnswerOption[], combCounts: Combination[], total: number): number {
    if (combCounts) {
      const correctIndexes = options.map(o => o.label).map(l => options.map(o => o.label).indexOf(l));
      const answeredCorrect = combCounts.filter(c => c.selectedChoiceIndexes.toString() === correctIndexes.toString());
      let correctCount = 0;
      if (answeredCorrect.length > 0) {
        correctCount = answeredCorrect[0].count;
      }
      this.contentCounter++;
      if (correctCount) {
        return (correctCount / total) * 100;
      } else {
        return correctCount;
      }
    } else {
      return this.status.empty;
    }
  }

  resetAllAnswers() {
    for (const content of this.dataSource) {
      content.abstentions = 0;
      content.counts = 0;
      content.percent = this.status.empty;
    }
    this.total = this.status.empty;
  }

  deleteAllAnswers() {
    this.contentService.showDeleteAllAnswersDialog(this.contentGroup).subscribe(() => {
      this.resetAllAnswers();
      this.translateService.get('content.all-answers-deleted').subscribe(msg => {
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      });
    });
  }
}
