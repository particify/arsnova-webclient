import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TextStatistic } from '@app/core/models/text-statistic';
import { UserRole } from '@app/core/models/user-roles.enum';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { TranslateService } from '@ngx-translate/core';
import { ContentService } from '@app/core/services/http/content.service';
import { DialogService } from '@app/core/services/util/dialog.service';

@Component({
  selector: 'app-answer-list',
  templateUrl: './answer-list.component.html',
  styleUrls: ['./answer-list.component.scss'],
})
export class AnswerListComponent implements OnInit {
  @Input() answers: TextStatistic[] = [];
  @Input() roomId: string;
  @Input() contentId: string;
  @Input() banMode = true;
  @Input() isPresentation = false;
  @Output() answerBanned = new EventEmitter<string>();
  @Output() answerDeleted = new EventEmitter<string>();

  isModerator = false;

  constructor(
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private notificationService: NotificationService,
    private contentAnswerService: ContentAnswerService,
    private contentService: ContentService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.isModerator =
      this.route.snapshot.data.viewRole !== UserRole.PARTICIPANT;
  }

  addToModerationList(answer: TextStatistic) {
    if (!answer.id) {
      return;
    }
    const action = this.banMode ? 'ban' : 'delete';
    const confirmAction = this.banMode
      ? this.contentService.banKeywordForContent(
          this.roomId,
          this.contentId,
          answer.answer
        )
      : this.contentAnswerService.hideAnswerText(this.roomId, answer.id);
    const dialogRef = this.dialogService.openDeleteDialog(
      `${action}-answer`,
      `really-${action}-answer`,
      answer.answer,
      action,
      () => confirmAction
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result === action) {
        if (this.banMode) {
          this.removeAnswerFromList(action);
          this.answerBanned.emit(answer.answer);
        } else {
          this.removeAnswerFromList(action);
          this.answerDeleted.emit(answer.id);
        }
      }
    });
  }

  removeAnswerFromList(action: 'ban' | 'delete') {
    const actionDone = action === 'ban' ? 'banned' : 'deleted';
    const msg = this.translateService.instant(`statistic.answer-${actionDone}`);
    this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
  }
}
