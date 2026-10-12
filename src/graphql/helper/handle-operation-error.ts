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

/** The classification of a failed operation's first error, if it is a known one. */
export function classifyOperationError(
  response: unknown
): ErrorClassification | undefined {
  if (!CombinedGraphQLErrors.is(response)) {
    return undefined;
  }
  const classification = response.errors[0].extensions?.['classification'];
  return Object.values(ErrorClassification).find((c) => c === classification);
}

export function handleOperationErrors(
  response: unknown,
  handlers: ErrorHandlers
) {
  const classification = classifyOperationError(response);
  if (classification) {
    (handlers[classification] ?? handlers[FALLBACK_HANDLER])?.();
  }
}
