import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { ContentService } from '../../../services/http/content.service';
import { Content } from '../../../models/content';
import { AnswerStatistics } from '../../../models/answer-statistics';
import { EventService } from '../../../services/util/event.service';
import { ContentMessages } from '../../../models/events/content-messages.enum';

@Component({
  template: ''
})
export abstract class StatisticContentBaseComponent implements OnInit {

  @Input() content: Content;
  @Input() directShow: boolean;
  @Output() updateCounterEvent: EventEmitter<number> = new EventEmitter<number>();
  @Input() isPresentation = false;
  @Input() active: boolean;

  contentId: string;
  isLoading = true;
  answersVisible = false;
  answerCount = 0;

  protected constructor(protected contentService: ContentService,
                        protected eventService: EventService) {
  }

  ngOnInit(): void {
    this.init();
    this.loadData().subscribe(stats => {
      this.initData(stats);
      this.isLoading = false;
      this.toggleAnswers(this.directShow);
    });
    this.afterInit();
    this.eventService.on(ContentMessages.ANSWERS_DELETED).subscribe(contentId => {
      if (this.content.id === contentId) {
        this.deleteAnswers();
      }
    });
  }

  init() {
  }

  initData(stats: any) {
  }

  afterInit() {
  }

  deleteAnswers() {
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
    } else {
      this.answerCount = 0;
    }
    this.updateCounterEvent.emit(this.answerCount);
  }
}
