import {
  Combination,
  MAX_COMBINATIONS,
  isAggregate,
  sameOrder,
  selectTopCombinations,
} from './combination-selection';

const CORRECT_ORDER = [0, 1, 2, 3];

const WRONG_ORDERS = [
  [1, 0, 2, 3],
  [2, 1, 0, 3],
  [3, 1, 2, 0],
  [0, 2, 1, 3],
  [0, 3, 2, 1],
  [0, 1, 3, 2],
  [1, 2, 3, 0],
];

/** One combination per count, none of them the correct order. */
function wrongOrders(...counts: number[]): Combination[] {
  return counts.map((count, i) => ({
    selectedChoiceIndexes: WRONG_ORDERS[i],
    count,
  }));
}

function total(combinations: Combination[]): number {
  return combinations.reduce((sum, combination) => sum + combination.count, 0);
}

function labels(combinations: Combination[]): string[] {
  return combinations.map((combination) =>
    isAggregate(combination)
      ? 'other'
      : combination.selectedChoiceIndexes.join('-')
  );
}

describe('selectTopCombinations', () => {
  it('charts every order while they fit', () => {
    const combinations: Combination[] = [
      { selectedChoiceIndexes: [0, 1, 2, 3], count: 5 },
      { selectedChoiceIndexes: [1, 0, 2, 3], count: 3 },
    ];
    expect(selectTopCombinations(combinations, CORRECT_ORDER)).toEqual(
      combinations
    );
  });

  it('charts nothing while there are no answers', () => {
    expect(selectTopCombinations([], CORRECT_ORDER)).toEqual([]);
  });

  it('orders the bars by count, descending', () => {
    const combinations: Combination[] = [
      { selectedChoiceIndexes: [1, 0, 2, 3], count: 2 },
      { selectedChoiceIndexes: [0, 1, 2, 3], count: 7 },
      { selectedChoiceIndexes: [3, 2, 1, 0], count: 4 },
    ];
    expect(
      selectTopCombinations(combinations, CORRECT_ORDER).map((c) => c.count)
    ).toEqual([7, 4, 2]);
  });

  it('leaves the given combinations untouched', () => {
    const combinations: Combination[] = [
      { selectedChoiceIndexes: [1, 0, 2, 3], count: 2 },
      { selectedChoiceIndexes: [0, 1, 2, 3], count: 7 },
    ];
    selectTopCombinations(combinations, CORRECT_ORDER);
    expect(combinations.map((c) => c.count)).toEqual([2, 7]);
  });

  it('aggregates everything past the top four into one bar', () => {
    const selected = selectTopCombinations(
      wrongOrders(10, 8, 6, 4, 3, 2, 1),
      CORRECT_ORDER
    );
    expect(selected.length).toBe(MAX_COMBINATIONS + 1);
    expect(selected.map((c) => c.count)).toEqual([10, 8, 6, 4, 6]);
    expect(isAggregate(selected[selected.length - 1])).toBe(true);
  });

  it('aggregates the single order too many rather than dropping it', () => {
    const answered = wrongOrders(10, 8, 6, 4, 3);
    const selected = selectTopCombinations(answered, CORRECT_ORDER);
    expect(selected.length).toBe(MAX_COMBINATIONS + 1);
    expect(selected.map((c) => c.count)).toEqual([10, 8, 6, 4, 3]);
    expect(isAggregate(selected[selected.length - 1])).toBe(true);
    expect(total(selected)).toBe(total(answered));
  });

  it('needs no aggregate bar while the orders exactly fill the chart', () => {
    const answered = wrongOrders(10, 8, 6, 4);
    const selected = selectTopCombinations(answered, CORRECT_ORDER);
    expect(selected.length).toBe(MAX_COMBINATIONS);
    expect(selected.map((c) => c.count)).toEqual([10, 8, 6, 4]);
    expect(selected.some(isAggregate)).toBe(false);
    expect(total(selected)).toBe(total(answered));
  });

  it('keeps the correct order in the top four where it belongs there', () => {
    const selected = selectTopCombinations(
      [
        { selectedChoiceIndexes: [1, 0, 2, 3], count: 9 },
        { selectedChoiceIndexes: CORRECT_ORDER, count: 8 },
        ...wrongOrders(3, 2, 1, 1),
      ],
      CORRECT_ORDER
    );
    expect(labels(selected)[1]).toBe('0-1-2-3');
  });

  it('splices the correct order in ahead of the aggregate bar', () => {
    const selected = selectTopCombinations(
      [
        ...wrongOrders(10, 9, 8, 7, 6, 5),
        { selectedChoiceIndexes: CORRECT_ORDER, count: 1 },
      ],
      CORRECT_ORDER
    );
    expect(labels(selected)).toEqual([
      ...labels(wrongOrders(10, 9, 8)),
      '0-1-2-3',
      'other',
    ]);
    expect(selected.map((c) => c.count)).toEqual([10, 9, 8, 1, 18]);
  });

  it('counts the order it displaced into the aggregate bar', () => {
    const answered = [
      ...wrongOrders(10, 9, 8, 7, 6, 5),
      { selectedChoiceIndexes: CORRECT_ORDER, count: 1 },
    ];
    const selected = selectTopCombinations(answered, CORRECT_ORDER);
    // 7 + 6 + 5, the displaced fourth included, and the correct order excluded.
    expect(selected[selected.length - 1].count).toBe(18);
    expect(total(selected)).toBe(total(answered));
  });

  it('leaves an unanswered correct order out of the chart', () => {
    const selected = selectTopCombinations(
      wrongOrders(10, 9, 8, 7, 6, 5),
      CORRECT_ORDER
    );
    expect(labels(selected)).not.toContain('0-1-2-3');
    expect(selected.map((c) => c.count)).toEqual([10, 9, 8, 7, 11]);
  });
});

describe('sameOrder', () => {
  it('accepts an identical order', () => {
    expect(sameOrder([0, 2, 1], [0, 2, 1])).toBe(true);
  });

  it('rejects a permuted order', () => {
    expect(sameOrder([0, 2, 1], [0, 1, 2])).toBe(false);
  });

  it('rejects an order of a different length', () => {
    expect(sameOrder([0, 1], [0, 1, 2])).toBe(false);
  });
});

describe('isAggregate', () => {
  it('recognises the aggregate bar by its empty order', () => {
    expect(isAggregate({ selectedChoiceIndexes: [], count: 4 })).toBe(true);
    expect(isAggregate({ selectedChoiceIndexes: [0, 1], count: 4 })).toBe(
      false
    );
  });
});
