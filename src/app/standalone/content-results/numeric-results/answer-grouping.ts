export interface AnswerGroup {
  groupStart: number;
  groupEnd: number;
  count: number;
}

const MAX_BARS = 15;
const COMPACT_NOTATION_START = 10_000;

/**
 * Buckets answers into at most `MAX_BARS` groups. A group counts the answers
 * in `[groupStart, groupStart + groupSize)`, so a decimal answer lands in the
 * group it falls into; the last group is closed at `maxNumber`. `groupEnd` is
 * the last whole number of a group, for the labels.
 *
 * The step sequence reproduces the v3 chart and skips 5 and 50: `groupSize`
 * is multiplied cumulatively by an alternating `[2, 5]`, so it runs 1, 2, 10,
 * 20, 100, 200. A range of 31 renders 4 bars where 7 were available.
 * Changing it is a deliberate visual change; a spec pins it.
 * Proposal: step through `{1, 2, 5} × 10^k`.
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
    const nextGroupStart = groupStart + groupSize;
    const last = nextGroupStart > maxNumber;
    groups.push({
      groupStart,
      groupEnd: last ? maxNumber : nextGroupStart - 1,
      count: countAnswers(
        selectedNumbers,
        counts,
        (n) => n >= groupStart && (last ? n <= maxNumber : n < nextGroupStart)
      ),
    });
  }
  return groups;
}

function countAnswers(
  selectedNumbers: number[],
  counts: number[],
  inGroup: (n: number) => boolean
): number {
  return counts.reduce(
    (sum, count, i) => sum + (inGroup(selectedNumbers[i]) ? count : 0),
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
