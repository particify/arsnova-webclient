import { Component, Input, OnInit, inject } from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { FormComponent } from '@app/standalone/form/form.component';
import { Content } from '@app/core/models/content';
import { ContentForm } from '@app/creator/content-group/content-editing/content-form';
import { ContentNumeric } from '@app/core/models/content-numeric';
import { ContentType } from '@app/core/models/content-type.enum';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { LocalizeDecimalSeperatorPipe } from '@app/core/pipes/localize-decimal-seperator.pipe';

const MAX_VALUE = 1_000_000_000_000_000; // Maximum value is up (or down) to one quadrillion

@Component({
  selector: 'app-numeric-content-form',
  templateUrl: './numeric-content-form.component.html',
  styleUrls: ['./numeric-content-form.component.scss'],
  providers: [
    {
      provide: 'ContentForm',
      useExisting: NumericContentFormComponent,
    },
  ],
  imports: [
    FlexModule,
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    LocalizeDecimalSeperatorPipe,
    TranslocoPipe,
  ],
})
export class NumericContentFormComponent
  extends FormComponent
  implements OnInit, ContentForm
{
  private notificationService = inject(NotificationService);
  private translateService = inject(TranslocoService);

  @Input() content?: Content;
  @Input() isEditMode = false;
  @Input() correctAnswerSelection = false;
  @Input() isAnswered = false;
  @Input() correctAnswer = true;

  minimum = 1;
  maximum = 100;
  correctNumber?: number;
  tolerance?: number;

  ngOnInit(): void {
    if (this.content?.format === ContentType.NUMERIC) {
      const content = this.content as ContentNumeric;
      this.minimum = content.minNumber;
      this.maximum = content.maxNumber;
      this.correctNumber = content.correctNumber;
      this.tolerance = content.tolerance || undefined;
    }
  }

  isMinimumTooLarge(): boolean {
    return this.minimum < -MAX_VALUE || this.minimum >= MAX_VALUE;
  }

  isMaximumTooLarge(): boolean {
    return this.maximum <= -MAX_VALUE || this.maximum > MAX_VALUE;
  }

  isRangeTooLarge(): boolean {
    return this.maximum - this.minimum > MAX_VALUE;
  }

  isCorrectOutOfRange(): boolean {
    const tolerance = this.tolerance || 0;
    return (
      this.correctNumber !== undefined &&
      (this.correctNumber - tolerance < this.minimum ||
        this.correctNumber + tolerance > this.maximum)
    );
  }

  isValid(): boolean {
    let errMsg: string | undefined = undefined;
    if (this.minimum >= this.maximum) {
      errMsg = this.translateService.translate(
        'creator.content.numeric-minimum-has-to-be-lower-than-maximum'
      );
    } else if (this.isMinimumTooLarge()) {
      errMsg = this.translateService.translate(
        'creator.content.numeric-minimum-too-large',
        { min: -MAX_VALUE }
      );
    } else if (this.isMaximumTooLarge()) {
      errMsg = this.translateService.translate(
        'creator.content.numeric-maximum-too-large',
        { max: MAX_VALUE }
      );
    } else if (this.isRangeTooLarge()) {
      errMsg = this.translateService.translate(
        'creator.content.numeric-range-too-large',
        { maxRange: MAX_VALUE }
      );
    } else if (
      this.correctAnswer &&
      (this.correctNumber === undefined || this.isCorrectOutOfRange())
    ) {
      errMsg = this.translateService.translate(
        'creator.content.select-correct-number-in-defined-range'
      );
    }
    if (errMsg) {
      this.notificationService.showAdvanced(
        errMsg,
        AdvancedSnackBarTypes.WARNING
      );
      return false;
    }
    return true;
  }

  getContent(): Content | undefined {
    let content: ContentNumeric;
    if (!this.isEditMode) {
      content = new ContentNumeric();
    } else {
      content = this.content as ContentNumeric;
    }
    if (!this.isValid()) {
      return;
    }
    content.minNumber = this.minimum;
    content.maxNumber = this.maximum;
    if (!this.correctAnswer) {
      content.correctNumber = undefined;
      content.tolerance = 0;
    } else {
      if (this.correctNumber !== undefined) {
        content.correctNumber = this.correctNumber;
      }
      if (this.tolerance !== undefined) {
        content.tolerance = this.tolerance;
      }
    }
    return content;
  }
}
