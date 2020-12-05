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
import { forkJoin } from 'rxjs';
import { AdvancedSnackBarTypes, NotificationService } from '../../../services/util/notification.service';
import { DialogService } from '../../../services/util/dialog.service';

export enum StatisticType {
  CHOICE = 'C',
  SURVEY = 'S',
  TEXT = 'T',
  SLIDE = 'I'
}

export class ContentStatistic {
  content: Content;
  type: StatisticType;
  percent: number;
  counts: number;
  abstentions: number;

  constructor(content: Content, type: StatisticType, percent: number, counts: number, abstentions: number) {
    this.content = content;
    this.type = type;
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

  constructor(
    private contentService: ContentService,
    private contentAnswerService: ContentAnswerService,
    private translateService: TranslateService,
    private router: Router,
    protected langService: LanguageService,
    protected route: ActivatedRoute,
    private globalStorageService: GlobalStorageService,
    private notificationService: NotificationService,
    private dialogService: DialogService
  ) {
    this.deviceType = this.globalStorageService.getItem(STORAGE_KEYS.DEVICE_TYPE);
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.shortId = params['shortId'];
    });
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    this.getContents();
    if (this.deviceType === 'desktop') {
      this.displayedColumns = ['content', 'counts', 'abstentions', 'percentage'];
    } else {
      this.displayedColumns = ['content', 'counts', 'percentage'];
    }
  }

  public getContents() {
    this.isLoading = true;
    this.contentService.getContentsByIds(this.contentGroup.roomId, this.contentGroup.contentIds).subscribe(contents => {
      this.getData(this.contentService.getSupportedContents(contents));
    });
  }

  goToStats(id: string) {
    const contentIndex = this.dataSource.map(d => d.content.id).indexOf(id);
    this.router.navigate([`/creator/room/${this.shortId}/group/${this.contentGroup.name}/statistics/${contentIndex + 1}`]);
    this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, this.contentGroup.name);
  }

  getData(contents: Content[]) {
    this.statisticsAdded = 0;
    this.statsLength = contents.length;
    this.dataSource = new Array<ContentStatistic>(this.statsLength);
    for (let i = 0; i < this.statsLength; i++) {
      const content = contents[i];
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
            this.addNewStatistic(i, new ContentStatistic(content, type, percent, count, abstentions));
          });
          break;
        case ContentType.SLIDE:
          abstentions = this.status.empty;
          count = this.status.empty;
          type = StatisticType.SLIDE;
          this.addNewStatistic(i, new ContentStatistic(content, type, percent, count, abstentions));
          break;
        default:
          this.contentService.getAnswer(this.contentGroup.roomId, content.id).subscribe(answer => {
            if (content.format === ContentType.CHOICE) {
              percent = this.evaluateMultiple((content as ContentChoice).options, answer.roundStatistics[0].combinatedCounts);
              count = this.getMultipleCounts(answer.roundStatistics[0].combinatedCounts);
            } else {
              if (content.format === ContentType.BINARY) {
                percent = this.evaluateSingle((content as ContentChoice).options, answer.roundStatistics[0].independentCounts);
              }
              count = this.getSingleCounts(answer.roundStatistics[0].independentCounts);
            }
            abstentions = answer.roundStatistics[0].abstentionCount;
            if (percent > this.status.empty) {
              type = StatisticType.CHOICE;
              this.totalP += percent;
              this.total = this.totalP / this.contentCounter;
            } else {
              type = StatisticType.SURVEY;
            }
            this.addNewStatistic(i, new ContentStatistic(content, type, percent, count, abstentions));
          });
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
      this.isLoading = false;
    }
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

  checkIfSurvey(options: AnswerOption[]): boolean {
    return Math.max.apply(Math, options.map(o => o.points)) > 0;
  }

  evaluateSingle(options: AnswerOption[], indCounts: number[]): number {

    if (this.checkIfSurvey(options)) {
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
    } else {
      return this.status.empty;
    }
  }

  evaluateMultiple(options: AnswerOption[], combCounts: Combination[]): number {
    if (this.checkIfSurvey(options)) {
      const combLength = combCounts.length;
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
    } else {
      return this.status.empty;
    }
  }

  public showDeleteAnswerDialog(): void {
    const dialogRef = this.dialogService.openDeleteDialog('really-delete-all-answers');
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteAllAnswers();
      }
    });
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
    const observableBatch = [];
    for (const data of this.dataSource) {
      observableBatch.push(this.contentService.deleteAnswers(this.contentGroup.roomId, data.content.id));
    }
    this.resetAllAnswers();
    forkJoin(observableBatch).subscribe(() => {
      this.translateService.get('content.all-answers-deleted').subscribe(msg => {
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      });
    });
  }

  showHelp(): void {
    this.dialogService.openStatisticHelpDialog();
  }
}
