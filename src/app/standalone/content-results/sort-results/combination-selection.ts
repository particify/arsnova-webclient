export interface Combination {
  selectedChoiceIndexes: number[];
  count: number;
}

export const MAX_COMBINATIONS = 4;

/**
 * Picks the orders to chart: the most answered ones, plus a single aggregate
 * bar for the remainder — marked by an empty `selectedChoiceIndexes`, which no
 * real order can have. The correct order is spliced in ahead of the aggregate
 * whenever it was answered but missed the top ones, so it is never absent from
 * the chart.
 *
 * The v3 chart is reproduced but for one thing: it added the aggregate only
 * from `MAX_COMBINATIONS + 2` orders upwards, so with exactly one order too
 * many the least answered one was dropped with nothing standing in for it.
 * Aggregating from any remainder upwards instead means every answer the server
 * counted is accounted for somewhere, as its own bar or inside the aggregate.
 *
 * The remaining flaw is kept, so that both versions stay comparable; changing
 * it is a deliberate visual change, and specs pin it. The chart degrades as the
 * answers spread out: with `n` items there are `n!` possible orders, so past a
 * handful of items the aggregate bar holds nearly every answer and the bars
 * beside it say almost nothing about how the audience ordered things.
 * Proposal: replace the per-order bars with a per-position breakdown — for each
 * rank, how often each item landed in it. That is bounded by `n²` bars however
 * the answers spread, reads as a heat map, and still shows the correct order as
 * its diagonal.
 */
export function selectTopCombinations(
  combinations: Combination[],
  correctOrder: number[]
): Combination[] {
  const ordered = [...combinations].sort((a, b) => b.count - a.count);
  let selected = ordered.slice(0, MAX_COMBINATIONS);
  if (
    includesOrder(ordered, correctOrder) &&
    !includesOrder(selected, correctOrder)
  ) {
    const correctIndex = ordered.findIndex((combination) =>
      sameOrder(combination.selectedChoiceIndexes, correctOrder)
    );
    ordered.splice(MAX_COMBINATIONS - 1, 0, ordered[correctIndex]);
    ordered.splice(correctIndex + 1, 1);
    selected = ordered.slice(0, MAX_COMBINATIONS);
  }
  if (ordered.length > MAX_COMBINATIONS) {
    selected.push({
      selectedChoiceIndexes: [],
      count: ordered
        .slice(MAX_COMBINATIONS)
        .reduce((sum, combination) => sum + combination.count, 0),
    });
  }
  return selected;
}

export function isAggregate(combination: Combination): boolean {
  return combination.selectedChoiceIndexes.length === 0;
}

export function sameOrder(order: number[], others: number[]): boolean {
  return (
    order.length === others.length &&
    order.every((index, i) => index === others[i])
  );
}

function includesOrder(combinations: Combination[], order: number[]): boolean {
  return combinations.some((combination) =>
    sameOrder(combination.selectedChoiceIndexes, order)
  );
}
