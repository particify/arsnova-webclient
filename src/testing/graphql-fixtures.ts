import { CombinedGraphQLErrors } from '@apollo/client';
import { Observable, throwError } from 'rxjs';

/**
 * A failed GraphQL operation without a classification, which the mutation
 * helper reports with its generic failure message.
 */
export function failedOperation(): Observable<never> {
  return throwError(
    () => new CombinedGraphQLErrors({ errors: [{ message: 'failed' }] })
  );
}
