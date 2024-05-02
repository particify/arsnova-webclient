import { Component, Input, OnInit } from '@angular/core';
import { AnswerOption } from '@app/core/models/answer-option';
import { AnnounceService } from '@app/core/services/util/announce.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { DisplayAnswer } from '@app/creator/content-group/content-editing/_models/display-answer';
import { DragDropBaseComponent } from '@app/standalone/drag-drop-base/drag-drop-base.component';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-answer-option-list',
  templateUrl: './answer-option-list.component.html',
  styleUrls: ['./answer-option-list.component.scss'],
})
export class AnswerOptionListComponent
  extends DragDropBaseComponent
  implements OnInit
{
  @Input() answers: DisplayAnswer[] = [];
  @Input() hasCorrectAnswers = false;
  @Input() hasMultipleCorrectAnswers = false;
  @Input() allowDeletion = false;
  @Input() disabled = false;
  @Input() sortable = false;

  isAnswerEdit = -1;

  constructor(
    private announceService: AnnounceService,
    private notificationService: NotificationService,
    private translateService: TranslocoService
  ) {
    super();
  }
  ngOnInit(): void {
    if (this.sortable) {
      this.updateDragDropList();
    }
  }

  isListValid(
    hasCorrectOptions: boolean,
    hasMultipleCorrectOptions: boolean
  ): boolean {
    let msg: string | undefined;
    if (!this.hasMinimumOptionCount()) {
      msg = this.translateService.translate('creator.content.need-answers');
    } else if (hasCorrectOptions) {
      if (hasMultipleCorrectOptions && !this.hasMoreCorrectOptions(0)) {
        msg = this.translateService.translate('creator.content.at-least-one');
      } else if (
        !hasMultipleCorrectOptions &&
        (!this.hasMoreCorrectOptions(0) || this.hasMoreCorrectOptions(1))
      ) {
        msg = this.translateService.translate('creator.content.select-one');
      }
    }
    if (msg) {
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return false;
    }
    return true;
  }

  switchValue(index: number) {
    const state = !this.answers[index].correct ? 'correct' : 'wrong';
    if (
      !this.hasMultipleCorrectAnswers &&
      this.answers.filter((d) => d.correct).length === 1
    ) {
      this.answers.forEach((val, i) => {
        if (index !== i) {
          val.correct = false;
        }
      });
    }
    this.announceService.announce('content.a11y-answer-marked-' + state);
  }

  goInEditMode(index: number): void {
    this.isAnswerEdit = index;
  }

  leaveEditMode(): void {
    this.saveAnswerLabels();
    this.isAnswerEdit = -1;
  }

  deleteAnswer(index: number) {
    this.answers.splice(index, 1);
    this.announceService.announce('creator.content.a11y-answer-deleted');
    const msg = this.translateService.translate(
      'creator.content.answer-deleted'
    );
    this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
  }

  private updateDragDropList() {
    this.dragDroplist = this.answers;
  }

  private saveAnswerLabels(checkForEmpty = false) {
    const answerLabels = this.answers.map(
      (a) => new AnswerOption(a.answerOption.label)
    );
    if (checkForEmpty) {
      let valid = true;
      const labels = answerLabels.map((a) => a.label);
      if (labels.includes('')) {
        const msg = this.translateService.translate(
          'creator.content.no-empty-fields-allowed'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.FAILED
        );
        valid = false;
      } else if (this.checkForDuplicates(labels)) {
        const msg = this.translateService.translate(
          'creator.content.same-answer'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
        valid = false;
      }
      return valid;
    }
  }

  private checkForDuplicates(labels: string[]) {
    return (
      labels.filter((answer, index) => labels.indexOf(answer) != index).length >
      0
    );
  }

  private hasMinimumOptionCount(): boolean {
    return this.answers.length > 1;
  }

  private hasMoreCorrectOptions(count: number): boolean {
    return this.answers.filter((d) => d.correct).length > count;
  }
}
