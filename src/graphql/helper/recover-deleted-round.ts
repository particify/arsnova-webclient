import { ApolloClient, OperationVariables } from '@apollo/client';
import {
  QuestionnaireContentByIdDocument,
  QuestionnaireContentsByQuestionnaireIdDocument,
  QuestionnairePublishedContentsByQuestionnaireIdDocument,
} from '@gql/generated/graphql';
import { QueryRef } from 'apollo-angular';
import { MonoTypeOperatorFunction, Observable, tap } from 'rxjs';
import { evictRounds } from './evict-round-stats';
import {
  ErrorClassification,
  classifyOperationError,
} from './handle-operation-error';
import { updateOn } from './update-on';

const recoveries = new WeakMap<ApolloClient, Promise<unknown>>();

/**
 * Forgets every round and reloads the watched contents, whose active rounds
 * reference the rounds replacing the deleted ones. Overlapping calls share
 * one recovery.
 */
export function recoverFromDeletedRound(
  client: ApolloClient
): Promise<unknown> {
  let recovery = recoveries.get(client);
  if (!recovery) {
    evictRounds(client.cache);
    recovery = client
      .refetchQueries({
        include: [
          QuestionnaireContentByIdDocument,
          QuestionnaireContentsByQuestionnaireIdDocument,
          QuestionnairePublishedContentsByQuestionnaireIdDocument,
        ],
      })
      .catch(() => undefined)
      .finally(() => recoveries.delete(client));
    recoveries.set(client, recovery);
  }
  return recovery;
}

/**
 * A round that is not found has been deleted, e.g. by a reset in another
 * tab. That is no error to show but a reason to reload the rounds.
 */
export function recoverOnRoundNotFound<T>(
  client: ApolloClient
): MonoTypeOperatorFunction<T> {
  return tap((result) => {
    const error = (result as { error?: unknown } | undefined)?.error;
    if (classifyOperationError(error) === ErrorClassification.NotFound) {
      recoverFromDeletedRound(client);
    }
  });
}

/** {@link updateOn} for a query and pushes about a round that may be deleted. */
export function updateRoundOn<
  TData,
  TVariables extends OperationVariables,
  TUpdate,
>(
  client: ApolloClient,
  queryRef: QueryRef<TData, TVariables>,
  updates$: Observable<TUpdate>,
  toData: (update: TUpdate) => TData | null | undefined
) {
  return updateOn(
    queryRef,
    updates$.pipe(recoverOnRoundNotFound(client)),
    toData
  ).pipe(recoverOnRoundNotFound(client));
}
