import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ContentService } from '@app/core/services/http/content.service';
import { TranslocoService, TranslocoPipe } from '@ngneat/transloco';
import { Content } from '@app/core/models/content';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { TextAnswer } from '@app/core/models/text-answer';
import { StatisticContentBaseComponent } from '@app/standalone/statistic-content/statistic-content-base';
import { Observable, takeUntil } from 'rxjs';
import { EventService } from '@app/core/services/util/event.service';
import { TextStatistic } from '@app/core/models/text-statistic';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { FlexModule } from '@angular/flex-layout';
import { NgClass } from '@angular/common';
import { AnswerListComponent } from '@app/standalone/answer-list/answer-list.component';

@Component({
  selector: 'app-statistic-text',
  templateUrl: './statistic-text.component.html',
  styleUrls: ['../text-statistic-content.scss'],
  standalone: true,
  imports: [
    NgClass,
    AnswerListComponent,
    FlexModule,
    LoadingIndicatorComponent,
    TranslocoPipe,
  ],
})
export class StatisticTextComponent
  extends StatisticContentBaseComponent
  implements OnInit, OnDestroy
{
  @Input({ required: true }) content!: Content;
  @Input() directShow = false;

  answerStats: TextStatistic[] = [];
  answers: TextAnswer[] = [];
  abstentionCount = 0;

  constructor(
    protected contentService: ContentService,
    private contentAnswerService: ContentAnswerService,
    protected translateService: TranslocoService,
    protected eventService: EventService,
    private dialogService: DialogService,
    private notificationService: NotificationService
  ) {
    super(contentService, eventService, translateService);
  }

  loadData(): Observable<TextAnswer[]> {
    return this.contentAnswerService.getAnswers(
      this.content.roomId,
      this.content.id
    );
  }

  init(answers: TextAnswer[]) {
    this.updateData(answers);
    this.getData();
  }

  afterInit() {
    this.contentService
      .getTextAnswerCreatedStream(this.content.roomId, this.content.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((msg) => {
        const answer = JSON.parse(msg.body).payload as TextAnswer;
        answer.contentId = this.content.id;
        this.addAnswerToList(answer);
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  deleteAnswers() {
    this.answers = [];
    this.getData();
  }

  updateData(answers: TextAnswer[]) {
    answers.forEach((answer) => {
      this.answers.push(answer);
    });
  }

  getData() {
    this.getAnswerStats();
    this.updateCounter(this.answerStats.map((a) => a.count));
  }

  getAnswerStats() {
    this.answerStats = [];
    const answersMap = new Map<string, TextStatistic>();
    for (const answer of this.answers) {
      if (answer.body) {
        const answerBody = answer.body.toLowerCase();
        const count = answersMap.has(answerBody)
          ? (answersMap.get(answerBody)?.count || 0) + 1
          : 1;
        answersMap.set(
          answerBody,
          new TextStatistic(answer.body, count, answer.id)
        );
      } else {
        this.abstentionCount++;
      }
    }
    answersMap.forEach((value: TextStatistic) => {
      this.answerStats.push(
        new TextStatistic(value.answer, value.count, value.id)
      );
    });
    this.answerStats.sort((a, b) => {
      return a.count > b.count ? -1 : 1;
    });
    if (this.abstentionCount > 0) {
      const abstentionString = this.translateService.translate(
        this.abstentionCount === 1
          ? 'statistic.abstention'
          : 'statistic.abstentions'
      );
      this.answerStats.push(
        new TextStatistic(abstentionString, this.abstentionCount)
      );
    }
  }

  deleteAnswer(answer: TextStatistic): void {
    const dialogRef = this.dialogService.openDeleteDialog(
      'delete-answer',
      'creator.dialog.really-delete-answer',
      answer.answer,
      'dialog.delete',
      () =>
        this.contentAnswerService.hideAnswerText(
          this.content.roomId,
          answer.id!
        )
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const msg = this.translateService.translate(
          'creator.statistic.answer-deleted'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
        this.filterAnswers(answer.id!);
      }
    });
  }

  private filterAnswers(answerId: string) {
    this.answerStats = this.answerStats.filter((a) => a.id !== answerId);
  }

  addAnswerToList(answer: TextAnswer) {
    this.answers.push(answer);
    this.getData();
  }
}
