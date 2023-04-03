import { CounterBracesPipe } from '@app/core/pipes/counter-braces.pipe';

describe('CounterBraces', () => {
  const pipe = new CounterBracesPipe();

  it('transforms "42" to "(42)"', () => {
    expect(pipe.transform(42)).toBe('(42)');
  });
});
