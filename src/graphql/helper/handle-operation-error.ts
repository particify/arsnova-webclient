import { CombinedGraphQLErrors } from '@apollo/client';

export enum ErrorClassification {
  BadRequest = 'BAD_REQUEST',
  Forbidden = 'FORBIDDEN',
  InternalError = 'INTERNAL_ERROR',
  NotFound = 'NOT_FOUND',
}

type ErrorHandler = () => void;

export const FALLBACK_HANDLER = 'fallback';

export type FallbackHandler = 'fallback';

export type ErrorHandlers = Partial<
  Record<ErrorClassification | FallbackHandler, ErrorHandler>
>;

export function handleOperationErrors(
  response: unknown,
  handlers: ErrorHandlers
) {
  if (!CombinedGraphQLErrors.is(response)) {
    return;
  }
  const classification = response.errors[0].extensions?.['classification'] as
    | ErrorClassification
    | undefined;
  if (classification) {
    (handlers[classification] ?? handlers[FALLBACK_HANDLER])?.();
  }
}
