export function sortedRoundNumbers(
  rounds: { id: string; roundNo: number }[],
  selectedRoundIds: string[]
): number[] {
  return selectedRoundIds
    .map((id) => rounds.find((round) => round.id === id)?.roundNo)
    .filter((roundNo): roundNo is number => roundNo != null)
    .sort((a, b) => a - b);
}

/** The selected rounds in round order; rounds not known yet go last. */
export function sortedRoundIds(
  rounds: { id: string; roundNo: number }[],
  selectedRoundIds: string[]
): string[] {
  const roundNo = (id: string) =>
    rounds.find((round) => round.id === id)?.roundNo ?? Infinity;
  return [...selectedRoundIds].sort((a, b) => roundNo(a) - roundNo(b));
}

export function toggleRoundSelection(
  selectedRoundIds: string[],
  roundId: string,
  allowComparison: boolean
): string[] {
  if (!allowComparison) {
    return [roundId];
  }
  if (selectedRoundIds.includes(roundId)) {
    return selectedRoundIds.length > 1
      ? selectedRoundIds.filter((id) => id !== roundId)
      : selectedRoundIds;
  }
  return selectedRoundIds.length < 2
    ? [...selectedRoundIds, roundId]
    : [selectedRoundIds[0], roundId];
}
