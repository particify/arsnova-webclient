import { OperationVariables } from '@apollo/client';
import { QueryRef } from 'apollo-angular';
import {
  EMPTY,
  Observable,
  catchError,
  ignoreElements,
  merge,
  tap,
} from 'rxjs';

/**
 * Emits the results of the query and writes each push of `updates$` into it,
 * so pushes, refetches and cache evictions all surface through the one
 * stream, for as long as the returned Observable is subscribed.
 *
 * `toData` turns a push into the data of the query; a push it maps to
 * nothing is ignored. A failing push stream is logged and leaves the query
 * and its last result alone.
 */
export function updateOn<TData, TVariables extends OperationVariables, TUpdate>(
  queryRef: QueryRef<TData, TVariables>,
  updates$: Observable<TUpdate>,
  toData: (update: TUpdate) => TData | null | undefined
) {
  return merge(
    queryRef.valueChanges,
    updates$.pipe(
      tap((update) => {
        const data = toData(update);
        if (data) {
          queryRef.updateQuery(() => data as never);
        }
      }),
      catchError((error) => {
        console.error('Updates of a watched query failed.', error);
        return EMPTY;
      }),
      ignoreElements()
    )
  );
}
