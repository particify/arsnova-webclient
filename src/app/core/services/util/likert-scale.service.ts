import { LikertScaleTemplate } from '@app/core/models/likert-scale-template.enum';

const scaleOptions = new Map([
  [4, ['positive-2', 'positive-1', 'negative-1', 'negative-2']],
  [5, ['positive-2', 'positive-1', 'neutral', 'negative-1', 'negative-2']],
]);
const scaleOptionLabels = new Map([
  [
    LikertScaleTemplate.EMOJI,
    new Map([
      [4, ['😀', '🙂', '🙁', '😟']],
      [5, ['😀', '🙂', '😐', '🙁', '😟']],
    ]),
  ],
  [
    LikertScaleTemplate.PLUS_MINUS,
    new Map([
      [4, ['++', '+', '−', '−−']],
      [5, ['++', '+', '0', '−', '−−']],
    ]),
  ],
  [
    LikertScaleTemplate.POINTS,
    new Map([
      [4, ['4', '3', '2', '1']],
      [5, ['5', '4', '3', '2', '1']],
    ]),
  ],
]);

export interface ScaleOptions {
  /** Most positive first, so an index matches a rating. */
  labels: string[];
  /** False where the labels are symbols, which must not reach transloco. */
  translate: boolean;
}

export class LikertScaleService {
  /**
   * Takes a string: the generated `ScaleContentTemplate` shares these values
   * but not the type.
   */
  getOptions(template: string, neutralOption: boolean): ScaleOptions {
    const optionCount = neutralOption ? 5 : 4;
    const likertTemplate = template as LikertScaleTemplate;
    return {
      labels: this.getOptionLabels(likertTemplate, optionCount) ?? [],
      translate: !this.getStaticOptionLabels(likertTemplate, optionCount),
    };
  }

  getOptionLabels(template: LikertScaleTemplate, optionCount: number) {
    const labels = this.getStaticOptionLabels(template, optionCount);
    const scaleOption = scaleOptions.get(optionCount);
    if (scaleOption) {
      return labels
        ? labels
        : scaleOption.map(
            (suffix) =>
              'option-template.' +
              template.toLowerCase().replace(/_/g, '-') +
              '-' +
              suffix
          );
    }
  }

  getStaticOptionLabels(template: LikertScaleTemplate, optionCount: number) {
    return scaleOptionLabels.get(template)?.get(optionCount);
  }
}
