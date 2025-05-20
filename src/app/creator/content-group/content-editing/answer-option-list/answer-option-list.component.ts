import { Component, Input, OnInit, inject } from '@angular/core';
import { AnnounceService } from '@app/core/services/util/announce.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { DisplayAnswer } from '@app/creator/content-group/content-editing/_models/display-answer';
import { DragDropBaseComponent } from '@app/standalone/drag-drop-base/drag-drop-base.component';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatList, MatListItem } from '@angular/material/list';
import { CdkDropList, CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { FlexModule } from '@angular/flex-layout';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-answer-option-list',
  templateUrl: './answer-option-list.component.html',
  styleUrls: ['./answer-option-list.component.scss'],
  imports: [
    MatList,
    CdkDropList,
    MatListItem,
    CdkDrag,
    FlexModule,
    CdkDragHandle,
    MatIcon,
    MatCheckbox,
    FormsModule,
    MatFormField,
    MatInput,
    MatIconButton,
    MatTooltip,
    TranslocoPipe,
  ],
})
export class AnswerOptionListComponent
  extends DragDropBaseComponent
  implements OnInit
{
  private announceService = inject(AnnounceService);
  private notificationService = inject(NotificationService);
  private translateService = inject(TranslocoService);

  @Input() answers: DisplayAnswer[] = [];
  @Input() hasCorrectAnswers = false;
  @Input() hasMultipleCorrectAnswers = false;
  @Input() allowDeletion = false;
  @Input() disabled = false;
  @Input() sortable = false;
  @Input() minimumAnswerCount = 2;
  @Input() lengthLimit = 500;

  isAnswerEdit = -1;
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
      msg = this.translateService.translate(this.getMinimumAnswerMessage());
    } else if (!this.areLabelsValid()) {
      return false;
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

  getMinimumAnswerMessage(): string {
    return this.minimumAnswerCount === 1
      ? 'creator.content.need-answer'
      : 'creator.content.need-answers';
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

  private areLabelsValid(): boolean {
    let msg: string | undefined;
    const labels = this.answers.map((a) => a.answerOption.label);
    if (labels.includes('')) {
      msg = this.translateService.translate(
        'creator.content.no-empty-fields-allowed'
      );
    } else if (this.checkForDuplicates(labels)) {
      msg = this.translateService.translate('creator.content.same-answer');
    }
    if (msg) {
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return false;
    }
    return true;
  }

  private checkForDuplicates(labels: string[]) {
    return (
      labels.filter((answer, index) => labels.indexOf(answer) != index).length >
      0
    );
  }

  private hasMinimumOptionCount(): boolean {
    return this.answers.length >= this.minimumAnswerCount;
  }

  private hasMoreCorrectOptions(count: number): boolean {
    return this.answers.filter((d) => d.correct).length > count;
  }
}
