import { LikertScaleTemplate } from '../../models/likert-scale-template.enum';

const scaleOptions = new Map([
  [4, [
    'positive-2',
    'positive-1',
    'negative-1',
    'negative-2'
  ]],
  [5, [
    'positive-2',
    'positive-1',
    'neutral',
    'negative-1',
    'negative-2'
  ]]
]);

export class LikertScaleService {
  getOptionLabels(template: LikertScaleTemplate, optionCount: number) {
   return scaleOptions.get(optionCount)
        .map(suffix => 'option-template.' + template.toLowerCase() + '-' + suffix);
  }
}
