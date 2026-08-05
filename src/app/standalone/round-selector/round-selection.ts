export function sortedRoundNumbers(
  rounds: { id: string; roundNo: number }[],
  selectedRoundIds: string[]
): number[] {
  return selectedRoundIds
    .map((id) => rounds.find((round) => round.id === id)?.roundNo)
    .filter((roundNo): roundNo is number => roundNo != null)
    .sort((a, b) => a - b);
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
