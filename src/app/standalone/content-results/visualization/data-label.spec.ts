import { dataLabel } from './data-label';

describe('dataLabel', () => {
  it('shows the value itself in absolute mode', () => {
    expect(dataLabel(7, 20, 'absolute')).toBe('7');
  });

  it('shows a whole-point share with a narrow no-break space in percent mode', () => {
    expect(dataLabel(1, 3, 'percent')).toBe('33 %');
  });

  it('shows no share of nothing rather than NaN', () => {
    expect(dataLabel(0, 0, 'percent')).toBe('0 %');
  });
});
