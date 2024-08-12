import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TextStatistic } from '@app/core/models/text-statistic';
import { UserRole } from '@app/core/models/user-roles.enum';
import { TranslocoPipe, provideTranslocoScope } from '@ngneat/transloco';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-answer-list',
  templateUrl: './answer-list.component.html',
  styleUrls: ['./answer-list.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    FlexModule,
    MatIconButton,
    MatTooltip,
    MatIcon,
    TranslocoPipe,
  ],
  providers: [provideTranslocoScope('creator')],
})
export class AnswerListComponent implements OnInit {
  @Input({ required: true }) answers!: TextStatistic[];
  @Input() banMode = true;
  @Input() isPresentation = false;
  @Output() deleteClicked = new EventEmitter<TextStatistic>();

  isModerator = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.isModerator =
      this.route.snapshot.data.viewRole !== UserRole.PARTICIPANT;
    this.answers = this.sortAnswers();
  }

  sortAnswers(): TextStatistic[] {
    return this.answers
      .sort((a, b) => (b.answer > a.answer ? -1 : 1))
      .sort((a, b) => b.count - a.count);
  }

  deleteAnswer(answer: TextStatistic): void {
    this.deleteClicked.emit(answer);
  }
}
