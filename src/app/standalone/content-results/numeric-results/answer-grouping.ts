export interface AnswerGroup {
  groupStart: number;
  groupEnd: number;
  count: number;
}

const MAX_BARS = 15;
const COMPACT_NOTATION_START = 10_000;

/**
 * Buckets answers into at most `MAX_BARS` groups, reproducing the v3 chart
 * exactly — including two flaws, kept so that both versions stay comparable.
 * Changing either is a deliberate visual change; specs pin both.
 *
 * 1. The step sequence skips 5 and 50: `groupSize` is multiplied cumulatively
 *    by an alternating `[2, 5]`, so it runs 1, 2, 10, 20, 100, 200. A range of
 *    31 renders 4 bars where 7 were available.
 *    Proposal: step through `{1, 2, 5} × 10^k`.
 * 2. Decimal answers between buckets are dropped: bounds are inclusive and
 *    integer-shaped, so a group size of 10 covers [0, 9] and [10, 19] and an
 *    answer of 9.5 matches neither. Reachable, as correct number and tolerance
 *    are unconstrained decimals.
 *    Proposal: half-open intervals `[groupStart, groupStart + groupSize)`.
 */
export function groupAnswerResults(
  minNumber: number,
  maxNumber: number,
  selectedNumbers: number[],
  counts: number[]
): AnswerGroup[] {
  const range = maxNumber - minNumber + 1;
  const maxGroups = Math.min(MAX_BARS, range);
  const factors = [2, 5];
  let groupSize = 1;
  let factorIndex = 0;
  while (range / groupSize > maxGroups) {
    groupSize *= factors[factorIndex];
    factorIndex = (factorIndex + 1) % factors.length;
  }
  const initialGroupStart = Math.floor(minNumber / groupSize) * groupSize;

  const groups: AnswerGroup[] = [];
  while (
    groups.length === 0 ||
    groups[groups.length - 1].groupEnd < maxNumber
  ) {
    const groupStart = initialGroupStart + groups.length * groupSize;
    const groupEnd = groupStart + groupSize - 1;
    groups.push({
      groupStart,
      groupEnd,
      count: countAnswersInGroup(selectedNumbers, counts, groupStart, groupEnd),
    });
  }
  return groups;
}

function countAnswersInGroup(
  selectedNumbers: number[],
  counts: number[],
  groupStart: number,
  groupEnd: number
): number {
  return counts.reduce(
    (sum, count, i) =>
      sum +
      (selectedNumbers[i] >= groupStart && selectedNumbers[i] <= groupEnd
        ? count
        : 0),
    0
  );
}

export function formatGroupLabel(groupStart: number, lang: string): string {
  if (Math.abs(groupStart) < COMPACT_NOTATION_START) {
    return groupStart.toString();
  }
  return Intl.NumberFormat(lang, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(groupStart);
}

export function groupTooltipTitles(groups: AnswerGroup[]): string[] {
  return groups.map((group) =>
    group.groupStart === group.groupEnd
      ? group.groupStart.toString()
      : group.groupStart + '–' + group.groupEnd
  );
}
