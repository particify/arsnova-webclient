import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChildren,
  inject,
} from '@angular/core';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { AnswerOption } from '@app/core/models/answer-option';
import { NgClass, TitleCasePipe } from '@angular/common';

const MAX_ANSWER_OPTIONS = 12;

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
    MatFormFieldModule,
    MatInput,
    MatIconButton,
    MatTooltip,
    TranslocoPipe,
    MatButton,
    NgClass,
    TitleCasePipe,
  ],
})
export class AnswerOptionListComponent
  extends DragDropBaseComponent
  implements OnInit, OnChanges
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
  @Input() optionLabel = 'option';
  @Input() optionLabels = 'options';

  @ViewChildren('optionInput') optionInputs!: QueryList<
    ElementRef<HTMLInputElement>
  >;

  isAnswerEdit = -1;
  isAdding = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.answers?.currentValue.length === 0) {
      this.initMinimumAnswerOptions();
    }
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
    if (!this.areLabelsValid()) {
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
    console.log('leave.. ', this.isAnswerEdit);
  }

  deleteAnswer(index: number) {
    this.answers.splice(index, 1);
    const msg = this.translateService.translate(
      'creator.content.option-deleted',
      {
        label: new TitleCasePipe().transform(
          this.translateService.translate('creator.content.' + this.optionLabel)
        ),
      }
    );
    this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
  }

  addOption() {
    if (this.answers.length < MAX_ANSWER_OPTIONS) {
      this.isAdding = true;
      this.answers.push(new DisplayAnswer(new AnswerOption(''), false));
      setTimeout(() => {
        this.focusInput(this.answers.length - 1);
      });
      setTimeout(() => {
        this.isAdding = false;
      }, 100);
    } else {
      const msg = this.translateService.translate(
        'creator.content.max-options',
        {
          max: MAX_ANSWER_OPTIONS,
          label: this.translateService.translate(
            'creator.content.' + this.optionLabel
          ),
        }
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.FAILED);
    }
  }

  goToNext(index: number) {
    if (this.isAdding) {
      return;
    }
    if (index < this.answers.length - 1) {
      this.focusInput(index + 1);
    } else {
      this.addOption();
    }
  }

  private focusInput(index: number) {
    const inputs = this.optionInputs.toArray();
    if (inputs.length) {
      const input = inputs[index];
      input.nativeElement.focus();
    }
  }

  private initMinimumAnswerOptions() {
    for (let i = 0; i < this.minimumAnswerCount; i++) {
      this.answers.push(new DisplayAnswer(new AnswerOption(''), false));
    }
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
      msg = this.translateService.translate('creator.content.same-option', {
        label: this.translateService.translate(
          'creator.content.' + this.optionLabel
        ),
      });
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

  private hasMoreCorrectOptions(count: number): boolean {
    return this.answers.filter((d) => d.correct).length > count;
  }
}
