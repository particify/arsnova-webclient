import { Component, Input, OnInit } from '@angular/core';
import { ContentChoice } from '@app/core/models/content-choice';
import { FormService } from '@app/core/services/util/form.service';
import { ContentType } from '@app/core/models/content-type.enum';
import { FormComponent } from '@app/standalone/form/form.component';
import { Content } from '@app/core/models/content';
import { TranslocoService } from '@ngneat/transloco';
import { AnswerOption } from '@app/core/models/answer-option';
import { ContentForm } from '@app/creator/content-group/content-editing/content-form';

enum BINARY_OPTION {
  NEITHER = 'neither',
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
})
export class BinaryContentFormComponent
  extends FormComponent
  implements OnInit, ContentForm
{
  @Input() content?: Content;
  @Input() isEditMode: boolean;
  options: BINARY_OPTION[] = Object.values(BINARY_OPTION);
  currentOption = BINARY_OPTION.NEITHER;

  constructor(
    private translateService: TranslocoService,
    protected formService: FormService
  ) {
    super(formService);
  }

  ngOnInit(): void {
    if (this.isEditMode) {
      const correctOptions = (this.content as ContentChoice)
        .correctOptionIndexes;
      if (correctOptions) {
        this.currentOption =
          correctOptions[0] === 0 ? BINARY_OPTION.YES : BINARY_OPTION.NO;
      }
    }
  }

  getContent(): Content | undefined {
    if (!this.isEditMode) {
      this.content = new ContentChoice();
      this.content.format = ContentType.BINARY;
    }
    if (this.currentOption !== BINARY_OPTION.NEITHER) {
      const index = this.currentOption === BINARY_OPTION.YES ? 0 : 1;
      (this.content as ContentChoice).correctOptionIndexes = [index];
    }
    const options: AnswerOption[] = [];
    this.options.forEach((val) => {
      if (val !== BINARY_OPTION.NEITHER) {
        options.push(
          new AnswerOption(
            this.translateService.translate('creator.content.' + val)
          )
        );
      }
    });
    (this.content as ContentChoice).options = options;
    return this.content;
  }
}
