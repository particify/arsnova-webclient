import { SplitShortIdPipe } from '@arsnova/app/pipes/split-short-id.pipe';
import { NBSP, THINSP } from '../utils/html-entities';

describe('SplitShortId', () => {
  const pipe = new SplitShortIdPipe();

  it('transforms "12345678" to "1234 5678" with small space', () => {
    expect(pipe.transform('12345678')).toBe('1234' + THINSP + '5678');
  });

  it('transforms "12345678" to "1234 5678" normal space', () => {
    expect(pipe.transform('12345678', false)).toBe('1234' + NBSP + '5678');
  });
});
