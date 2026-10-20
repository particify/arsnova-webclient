import { Round } from '@gql/generated/graphql';

export type AnsweringRound = Pick<
  Round,
  'id' | 'closed' | 'answeringEndTime' | 'answerable'
>;

export function answeringEndDate(
  round?: AnsweringRound | null
): Date | undefined {
  return round?.answeringEndTime ? new Date(round.answeringEndTime) : undefined;
}

export function roundKey(round?: AnsweringRound | null): string | undefined {
  if (!round) {
    return undefined;
  }
  return `${round.id}|${round.closed}|${round.answeringEndTime ?? ''}`;
}

/**
 * Whether a round is no longer answerable, i.e. it is closed, or its
 * deadline has passed (backend-known `answerable`, plus a client-side
 * `endDate` check to catch a deadline that expired since the last fetch).
 */
export function isRoundOver(
  round: AnsweringRound | null | undefined,
  now: number,
  live: boolean
): boolean {
  if (!live || !round) {
    return false;
  }
  if (!round.answerable) {
    return true;
  }
  const endDate = answeringEndDate(round);
  return !!endDate && endDate.getTime() <= now;
}
