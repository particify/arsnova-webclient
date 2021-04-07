import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../../services/http/content.service';
import { Content } from '../../../models/content';
import { AnswerStatistics } from '../../../models/answer-statistics';

@Component({
  template: ''
})
export abstract class StatisticContentBaseComponent implements OnInit {

  @Input() content: Content;
  @Input() directShow: boolean;
  @Output() updateCounterEvent: EventEmitter<number> = new EventEmitter<number>();
  @Input() isPresentation = false;

  contentId: string;
  isLoading = true;
  answersVisible = false;
  answerCount = 0;

  protected constructor(protected route: ActivatedRoute,
                        protected contentService: ContentService) {
  }

  ngOnInit(): void {
    this.init();
    this.loadData().subscribe(stats => {
      this.initData(stats);
      this.isLoading = false;
      this.toggleAnswers(this.directShow);
    });
    this.afterInit();
  }

  init() {
  }

  initData(stats: any) {
  }

  afterInit() {
  }

  toggleAnswers(visible?: boolean): boolean {
    this.answersVisible = visible ?? !this.answersVisible;
    return this.answersVisible;
  }

  loadData(): Observable<any> {
    return this.contentService.getAnswer(this.content.roomId, this.content.id);
  }

  updateData(stats: AnswerStatistics) {
  }

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
    }
    this.updateCounterEvent.emit(this.answerCount);
  }
}
