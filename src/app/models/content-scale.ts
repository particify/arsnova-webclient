import { ContentChoice } from './content-choice'
import { ContentType } from './content-type.enum';
import { LikertScaleTemplate } from './likert-scale-template.enum'

export class ContentScale extends ContentChoice {
  optionTemplate: LikertScaleTemplate;
  optionCount: number;

  constructor(optionTemplate: LikertScaleTemplate, optionCount: number) {
    super(
      null,
      null,
      '',
      '',
      '',
      [],
      [],
      [],
      false,
      ContentType.SCALE,
      null
    );
    this.optionTemplate = optionTemplate;
    this.optionCount = optionCount;
  }
}
