import { LikertScaleTemplate } from '@app/core/models/likert-scale-template.enum';
import { LikertScaleService } from './likert-scale.service';

describe('LikertScaleService', () => {
  const service = new LikertScaleService();

  it('offers five translatable options with a neutral one', () => {
    expect(service.getOptions(LikertScaleTemplate.AGREEMENT, true)).toEqual({
      labels: [
        'option-template.agreement-positive-2',
        'option-template.agreement-positive-1',
        'option-template.agreement-neutral',
        'option-template.agreement-negative-1',
        'option-template.agreement-negative-2',
      ],
      translate: true,
    });
  });

  it('offers four options without the neutral one', () => {
    expect(
      service.getOptions(LikertScaleTemplate.AGREEMENT, false).labels
    ).toEqual([
      'option-template.agreement-positive-2',
      'option-template.agreement-positive-1',
      'option-template.agreement-negative-1',
      'option-template.agreement-negative-2',
    ]);
  });

  it('turns underscores of a template into dashes of its keys', () => {
    expect(
      service.getOptionLabels(LikertScaleTemplate.PLUS_MINUS, 4)
    ).not.toContain(jasmine.stringContaining('_'));
    expect(service.getOptionLabels(LikertScaleTemplate.PACE, 4)?.[0]).toBe(
      'option-template.pace-positive-2'
    );
  });

  it('keeps symbol labels away from translation', () => {
    expect(service.getOptions(LikertScaleTemplate.EMOJI, true)).toEqual({
      labels: ['😀', '🙂', '😐', '🙁', '😟'],
      translate: false,
    });
    expect(service.getOptions(LikertScaleTemplate.POINTS, false)).toEqual({
      labels: ['4', '3', '2', '1'],
      translate: false,
    });
  });
});
