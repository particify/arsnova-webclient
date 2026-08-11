import {
  formatGroupLabel,
  groupAnswerResults,
  groupTooltipTitles,
} from './answer-grouping';

function bounds(minNumber: number, maxNumber: number): [number, number][] {
  return groupAnswerResults(minNumber, maxNumber, [], []).map((group) => [
    group.groupStart,
    group.groupEnd,
  ]);
}

function groupSize(minNumber: number, maxNumber: number): number {
  const [first] = bounds(minNumber, maxNumber);
  return first[1] - first[0] + 1;
}

describe('groupAnswerResults', () => {
  it('uses one group per value while the range fits into the bar limit', () => {
    expect(bounds(1, 5)).toEqual([
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [5, 5],
    ]);
  });

  it('produces a single group for a range of one', () => {
    expect(bounds(1, 1)).toEqual([[1, 1]]);
  });

  it('grows the group size once the range exceeds the bar limit', () => {
    expect(groupSize(1, 15)).toBe(1);
    expect(bounds(1, 16)).toEqual([
      [0, 1],
      [2, 3],
      [4, 5],
      [6, 7],
      [8, 9],
      [10, 11],
      [12, 13],
      [14, 15],
      [16, 17],
    ]);
  });

  it('aligns groups to a multiple of the group size', () => {
    const groups = bounds(3, 40);
    expect(groups[0]).toEqual([0, 9]);
    expect(groups[groups.length - 1]).toEqual([40, 49]);
  });

  it('covers a negative minimum', () => {
    expect(bounds(-10, 10)).toEqual([
      [-10, -9],
      [-8, -7],
      [-6, -5],
      [-4, -3],
      [-2, -1],
      [0, 1],
      [2, 3],
      [4, 5],
      [6, 7],
      [8, 9],
      [10, 11],
    ]);
  });

  // Pinned, not aspirational: see limitation 1 on groupAnswerResults.
  it('steps the group size through 1, 2, 10, 20, 100, 200', () => {
    expect(groupSize(1, 15)).toBe(1);
    expect(groupSize(1, 16)).toBe(2);
    expect(groupSize(1, 31)).toBe(10);
    expect(groupSize(1, 151)).toBe(20);
    expect(groupSize(1, 301)).toBe(100);
    expect(groupSize(1, 1501)).toBe(200);
  });

  it('counts answers on both inclusive bounds of a group', () => {
    const groups = groupAnswerResults(0, 40, [0, 9, 10, 19], [1, 2, 4, 8]);
    expect(groups.slice(0, 2)).toEqual([
      { groupStart: 0, groupEnd: 9, count: 3 },
      { groupStart: 10, groupEnd: 19, count: 12 },
    ]);
  });

  // Pinned, not aspirational: see limitation 2 on groupAnswerResults.
  it('drops an answer that falls between two inclusive groups', () => {
    const groups = groupAnswerResults(0, 40, [9.5], [3]);
    expect(groups.map((group) => group.count)).toEqual([0, 0, 0, 0, 0]);
  });

  it('keeps a count of zero for groups without answers', () => {
    const groups = groupAnswerResults(1, 3, [2], [7]);
    expect(groups.map((group) => group.count)).toEqual([0, 7, 0]);
  });
});

describe('formatGroupLabel', () => {
  it('renders numbers below ten thousand as they are', () => {
    expect(formatGroupLabel(0, 'en')).toBe('0');
    expect(formatGroupLabel(9999, 'en')).toBe('9999');
    expect(formatGroupLabel(-9999, 'en')).toBe('-9999');
  });

  it('abbreviates numbers from ten thousand on', () => {
    expect(formatGroupLabel(10_000, 'en')).toBe('10K');
    expect(formatGroupLabel(-10_000, 'en')).toBe('-10K');
    expect(formatGroupLabel(1_500_000, 'en')).toBe('1.5M');
  });
});

describe('groupTooltipTitles', () => {
  it('titles a group holding a single value with that value', () => {
    expect(groupTooltipTitles(groupAnswerResults(1, 5, [], []))).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
    ]);
  });

  it('titles a group spanning several values with its range', () => {
    expect(groupTooltipTitles(groupAnswerResults(1, 16, [], []))[0]).toBe(
      '0–1'
    );
  });
});
