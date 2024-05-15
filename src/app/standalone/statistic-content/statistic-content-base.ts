import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ContentService } from '@app/core/services/http/content.service';
import { Content } from '@app/core/models/content';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { EventService } from '@app/core/services/util/event.service';
import { TextAnswer } from '@app/core/models/text-answer';
import { UserSettings } from '@app/core/models/user-settings';
import { ChartTypeRegistry, TooltipItem } from 'chart.js';
import { TranslocoService } from '@ngneat/transloco';

export const ABSTENTION_SIGN = '–';

@Component({
  template: '',
})
export abstract class StatisticContentBaseComponent implements OnInit {
  @Input({ required: true }) content!: Content;
  @Input() directShow = false;
  @Output() updateCounterEvent: EventEmitter<number> =
    new EventEmitter<number>();
  @Input() isPresentation = false;
  @Input() active = false;
  @Input() settings: UserSettings = new UserSettings();

  destroyed$ = new Subject<void>();
  isLoading = true;
  answersVisible = false;
  answerCount = 0;

  protected constructor(
    protected contentService: ContentService,
    protected eventService: EventService,
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

  updateCounter(list: number[]) {
    if (list.length > 0) {
      this.answerCount = this.getSum(list);
    } else {
      this.answerCount = 0;
    }
    this.updateCounterEvent.emit(this.answerCount);
  }

  getDataLabel(value: number, roundData: number[]): string {
    let label: string;
    if (this.settings.contentVisualizationUnitPercent) {
      label = this.getLabelWithPercentageSign(
        ((value / this.getSum(roundData)) * 100).toFixed(0)
      );
    } else {
      label = value.toString();
    }
    return label;
  }

  protected getLabelWithPercentageSign(label: string) {
    return label + '\u202F%';
  }

  protected getTooltipTitle(
    item: TooltipItem<keyof ChartTypeRegistry>
  ): string {
    return item.label === ABSTENTION_SIGN
      ? this.translateService.translate('statistic.abstentions')
      : item.label;
  }
}
