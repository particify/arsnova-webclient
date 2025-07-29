import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentType } from '@app/core/models/content-type.enum';
import { FormComponent } from '@app/standalone/form/form.component';
import { Content } from '@app/core/models/content';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { AnswerOption } from '@app/core/models/answer-option';
import { ContentForm } from '@app/creator/content-group/content-editing/content-form';
import { FormsModule } from '@angular/forms';
import { FlexModule } from '@angular/flex-layout';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';

enum BINARY_OPTION {
  YES = 'yes',
  NO = 'no',
}

@Component({
  selector: 'app-binary-content-form',
  templateUrl: './binary-content-form.component.html',
  styleUrls: ['./binary-content-form.component.scss'],
  providers: [
    {
      provide: 'ContentForm',
      useExisting: BinaryContentFormComponent,
    },
  ],
  imports: [
    FormsModule,
    FlexModule,
    MatRadioGroup,
    MatRadioButton,
    TranslocoPipe,
  ],
})
export class BinaryContentFormComponent
  extends FormComponent
  implements OnChanges, ContentForm
{
  private translateService = inject(TranslocoService);

  @Input() content?: Content;
  @Input() isEditMode = false;
  @Input() correctAnswer = false;
  options: BINARY_OPTION[] = Object.values(BINARY_OPTION);
  currentOption?: BINARY_OPTION;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.content?.currentValue) {
      if (this.content?.format === ContentType.BINARY) {
        const correctOptions = (this.content as ContentChoice)
          .correctOptionIndexes;
        if (correctOptions) {
          this.currentOption =
            correctOptions[0] === 0 ? BINARY_OPTION.YES : BINARY_OPTION.NO;
        }
      } else if (this.correctAnswer) {
        this.currentOption = BINARY_OPTION.YES;
      }
    }
  }

  getContent(): Content | undefined {
    if (!this.isEditMode) {
      this.content = new ContentChoice();
      this.content.format = ContentType.BINARY;
    }
    if (this.correctAnswer) {
      const index = this.currentOption === BINARY_OPTION.YES ? 0 : 1;
      (this.content as ContentChoice).correctOptionIndexes = [index];
    } else {
      (this.content as ContentChoice).correctOptionIndexes = [];
    }
    const options: AnswerOption[] = [];
    this.options.forEach((val) => {
      options.push(
        new AnswerOption(
          this.translateService.translate('creator.content.' + val)
        )
      );
    });
    (this.content as ContentChoice).options = options;
    return this.content;
  }
}
