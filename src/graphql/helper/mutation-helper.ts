import { inject } from '@angular/core';
import { CombinedGraphQLErrors } from '@apollo/client';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@jsverse/transloco';
import { EMPTY, MonoTypeOperatorFunction, catchError, throwError } from 'rxjs';
import {
  ErrorHandlers,
  FALLBACK_HANDLER,
  classifyOperationError,
} from './handle-operation-error';

/**
 * Error handling shared by the mutation call sites of a component.
 *
 * A classified error goes to the matching handler, else to the fallback
 * handler, else to the snackbar for client errors. A GraphQL error without
 * a known classification raises the generic error snackbar. Transport errors
 * are left alone, the Apollo error link reports them already.
 */
export class MutationHelper {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly translateService: TranslocoService
  ) {}

  /** Reports a failed mutation and completes, for subscribers that only handle success. */
  handleErrors<T>(handlers: ErrorHandlers = {}): MonoTypeOperatorFunction<T> {
    return catchError((error) => {
      this.report(error, handlers);
      return EMPTY;
    });
  }

  /** Reports a failed mutation and passes the error on, for subscribers with an error branch. */
  reportErrors<T>(handlers: ErrorHandlers = {}): MonoTypeOperatorFunction<T> {
    return catchError((error) => {
      this.report(error, handlers);
      return throwError(() => error);
    });
  }

  private report(error: unknown, handlers: ErrorHandlers) {
    const classification = classifyOperationError(error);
    if (classification) {
      const handler =
        handlers[classification] ??
        handlers[FALLBACK_HANDLER] ??
        (() => this.notificationService.showOnRequestClientError(error));
      handler();
    } else if (CombinedGraphQLErrors.is(error)) {
      this.notificationService.showAdvanced(
        this.translateService.translate('errors.something-went-wrong'),
        AdvancedSnackBarTypes.FAILED
      );
    }
  }
}

/** Creates the helper for the calling component; needs an injection context. */
export function mutationHelper(): MutationHelper {
  return new MutationHelper(
    inject(NotificationService),
    inject(TranslocoService)
  );
}
