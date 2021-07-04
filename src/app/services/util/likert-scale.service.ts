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
const scaleOptionLabels = new Map([
  [LikertScaleTemplate.EMOJI, new Map([
    [4, [
      '😀',
      '🙂',
      '🙁',
      '😟'
    ]],
    [5, [
      '😀',
      '🙂',
      '😐',
      '🙁',
      '😟'
    ]]
  ])],
  [LikertScaleTemplate.PLUS_MINUS, new Map([
    [4, [
      '++',
      '+',
      '−',
      '−−'
    ]],
    [5, [
      '++',
      '+',
      '0',
      '−',
      '−−'
    ]]
  ])],
  [LikertScaleTemplate.POINTS, new Map([
    [4, [
      '4',
      '3',
      '2',
      '1'
    ]],
    [5, [
      '5',
      '4',
      '3',
      '2',
      '1'
    ]]
  ])]
])

export class LikertScaleService {
  getOptionLabels(template: LikertScaleTemplate, optionCount: number) {
    const labels = this.getStaticOptionLabels(template, optionCount);
    return labels ? labels : scaleOptions.get(optionCount)
        .map(suffix => 'option-template.' + template.toLowerCase().replace(/_/g, '-') + '-' + suffix);
  }

  getStaticOptionLabels(template: LikertScaleTemplate, optionCount: number) {
    return scaleOptionLabels.get(template)?.get(optionCount);
  }
}
