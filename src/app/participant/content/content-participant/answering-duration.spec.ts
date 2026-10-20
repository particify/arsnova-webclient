import { formatAnsweringDuration } from './answering-duration';

describe('formatAnsweringDuration', () => {
  it('returns undefined for undefined', () => {
    expect(formatAnsweringDuration(undefined)).toBeUndefined();
  });

  it('returns undefined for null', () => {
    expect(formatAnsweringDuration(null)).toBeUndefined();
  });

  it('formats zero without treating it as missing', () => {
    expect(formatAnsweringDuration(0)).toBe('0.00');
  });

  it('formats a duration in milliseconds as seconds with two decimals', () => {
    expect(formatAnsweringDuration(10100)).toBe('10.10');
  });
});
