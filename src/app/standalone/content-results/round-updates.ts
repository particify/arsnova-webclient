import { Round } from '@gql/generated/graphql';
import { Observable, filter, switchMap, take } from 'rxjs';

/**
 * The pushes about a round, from the moment it is open: a closed round's
 * answers cannot change, but restarting reopens it under the same id. A
 * round closing while shown keeps them, for answers racing the close.
 */
export function updatesOnceOpen<T>(
  rounds$: Observable<Round[]>,
  roundId: string,
  updates: () => Observable<T>
): Observable<T> {
  return rounds$.pipe(
    filter((rounds) => !rounds.find((round) => round.id === roundId)?.closed),
    take(1),
    switchMap(() => updates())
  );
}
