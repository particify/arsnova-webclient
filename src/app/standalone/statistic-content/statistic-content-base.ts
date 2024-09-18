import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ContentService } from '@app/core/services/http/content.service';
import { Content } from '@app/core/models/content';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { TextAnswer } from '@app/core/models/text-answer';
import { UserSettings } from '@app/core/models/user-settings';
import { TranslocoService } from '@jsverse/transloco';
import { AnswerResponseCounts } from '@app/core/models/answer-response-counts';

@Component({
  template: '',
})
export abstract class StatisticContentBaseComponent implements OnInit {
  @Input({ required: true }) content!: Content;
  @Input() directShow = false;
  @Output() updateCounterEvent: EventEmitter<AnswerResponseCounts> =
    new EventEmitter<AnswerResponseCounts>();
  @Input() isPresentation = false;
  @Input() active = false;
  @Input() settings: UserSettings = new UserSettings();

  destroyed$ = new Subject<void>();
  isLoading = true;
  answersVisible = false;
  responseCounts: AnswerResponseCounts = { answers: 0, abstentions: 0 };

  protected constructor(
    protected contentService: ContentService,
    protected translateService: TranslocoService
  ) {}

  ngOnInit(): void {
    this.loadData().subscribe((stats) => {
      this.init(stats);
      this.isLoading = false;
      this.toggleAnswers(this.directShow);
    });
    this.afterInit();
    this.contentService
      .getAnswersDeleted()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((contentId) => {
        if (this.content.id === contentId) {
          this.deleteAnswers();
        }
      });
  }

  abstract init(stats: AnswerStatistics | TextAnswer[]): void;

  abstract afterInit(): void;

  abstract deleteAnswers(): void;

  toggleAnswers(visible?: boolean): boolean {
    this.answersVisible = visible ?? !this.answersVisible;
    return this.answersVisible;
  }

  loadData(): Observable<any> {
    return this.contentService.getAnswer(this.content.roomId, this.content.id);
  }

  abstract updateData(stats: AnswerStatistics | TextAnswer[]): void;

  getSum(list: number[]): number {
    if (list.length > 0) {
      return list.reduce((a, b) => a + b);
    } else {
      return 0;
    }
  }

  updateCounter(responseCounts: AnswerResponseCounts) {
    this.responseCounts = responseCounts;
    this.updateCounterEvent.emit(this.responseCounts);
  }

  getDataLabel(value: number, roundData: number[], count?: number): string {
    let label: string;
    const total = count ?? this.getSum(roundData);
    if (this.settings.contentVisualizationUnitPercent) {
      value = total ? (value / total) * 100 : 0;
      label = this.getLabelWithPercentageSign(value.toFixed(0));
    } else {
      label = value.toString();
    }
    return label;
  }

  protected getLabelWithPercentageSign(label: string) {
    return label + '\u202F%';
  }
}
