import { TestBed } from '@angular/core/testing';
import { CombinedGraphQLErrors } from '@apollo/client';
import { NotificationService } from '@app/core/services/util/notification.service';
import { TranslocoService } from '@jsverse/transloco';
import { Observable, of, throwError } from 'rxjs';
import { ErrorClassification } from './handle-operation-error';
import { MutationHelper, mutationHelper } from './mutation-helper';

describe('MutationHelper', () => {
  let helper: MutationHelper;
  let notificationService: jasmine.SpyObj<NotificationService>;

  function graphqlError(classification?: string) {
    return new CombinedGraphQLErrors({
      errors: [
        {
          message: 'failed',
          extensions: classification ? { classification } : {},
        },
      ],
    });
  }

  function subscribe<T>(source: Observable<T>) {
    const events: string[] = [];
    source.subscribe({
      next: () => events.push('next'),
      error: () => events.push('error'),
      complete: () => events.push('complete'),
    });
    return events;
  }

  beforeEach(() => {
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
      'showOnRequestClientError',
    ]);
    TestBed.configureTestingModule({
      providers: [
        { provide: NotificationService, useValue: notificationService },
        {
          provide: TranslocoService,
          useValue: { translate: (k: string) => k },
        },
      ],
    });
    helper = TestBed.runInInjectionContext(() => mutationHelper());
  });

  it('passes a result through', () => {
    expect(subscribe(of('result').pipe(helper.handleErrors()))).toEqual([
      'next',
      'complete',
    ]);
  });

  it('calls the handler of a classified error and completes', () => {
    const forbidden = jasmine.createSpy('forbidden');
    const error = graphqlError(ErrorClassification.Forbidden);

    const events = subscribe(
      throwError(() => error).pipe(
        helper.handleErrors({ [ErrorClassification.Forbidden]: forbidden })
      )
    );

    expect(forbidden).toHaveBeenCalled();
    expect(notificationService.showOnRequestClientError).not.toHaveBeenCalled();
    expect(events).toEqual(['complete']);
  });

  it('shows the client error snackbar for an unhandled classification', () => {
    const error = graphqlError(ErrorClassification.BadRequest);

    subscribe(throwError(() => error).pipe(helper.handleErrors()));

    expect(notificationService.showOnRequestClientError).toHaveBeenCalledWith(
      error
    );
  });

  it('shows the generic error snackbar for an unclassified GraphQL error', () => {
    subscribe(
      throwError(() => graphqlError('ValidationError')).pipe(
        helper.handleErrors()
      )
    );

    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      'errors.something-went-wrong',
      jasmine.anything()
    );
  });

  it('leaves a transport error to the error link', () => {
    const events = subscribe(
      throwError(() => new Error('Network')).pipe(helper.handleErrors())
    );

    expect(notificationService.showAdvanced).not.toHaveBeenCalled();
    expect(events).toEqual(['complete']);
  });

  it('passes the error on after reporting it', () => {
    const error = graphqlError(ErrorClassification.NotFound);

    const events = subscribe(
      throwError(() => error).pipe(helper.reportErrors())
    );

    expect(notificationService.showOnRequestClientError).toHaveBeenCalledWith(
      error
    );
    expect(events).toEqual(['error']);
  });
});
