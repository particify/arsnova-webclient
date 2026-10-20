import { OperationVariables } from '@apollo/client';
import { QueryRef } from 'apollo-angular';
import {
  EMPTY,
  Observable,
  catchError,
  from,
  ignoreElements,
  merge,
  switchMap,
} from 'rxjs';

/**
 * Emits the results of the query and refetches it whenever `trigger$` emits,
 * for as long as the returned Observable is subscribed.
 */
export function refetchOn<TData, TVariables extends OperationVariables>(
  queryRef: QueryRef<TData, TVariables>,
  trigger$: Observable<unknown>
) {
  return merge(
    queryRef.valueChanges,
    trigger$.pipe(
      switchMap(() => from(queryRef.refetch()).pipe(catchError(() => EMPTY))),
      ignoreElements()
    )
  );
}
