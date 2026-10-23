import { signal } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CombinedGraphQLErrors, ServerError } from '@apollo/client';
import { ChallengeService } from '@app/core/services/challenge.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import {
  PasswordStrengthRequest,
  PasswordStrengthResult,
  PasswordStrengthService,
} from '@app/core/services/util/password-strength.service';
import { UserPasswordStrengthGql } from '@gql/generated/graphql';
import { Subject, map, of, throwError } from 'rxjs';

const PASSWORD = 'correct horse battery';
const MAIL_ADDRESS = 'user@example.com';
const OTHER_MAIL_ADDRESS = 'other@example.com';

function rating(acceptable: boolean, relativeStrength: number, hint?: string) {
  return of({
    data: {
      userPasswordStrength: {
        acceptable,
        relativeStrength,
        hint: hint ?? null,
      },
    },
  });
}

describe('PasswordStrengthService', () => {
  let service: PasswordStrengthService;
  let fetch: jasmine.Spy;
  let authenticationService: jasmine.SpyObj<AuthenticationService>;
  let challengeService: jasmine.SpyObj<ChallengeService>;
  const sessionToken = signal<string | undefined>(undefined);
  let passwords: Subject<string>;
  let results: PasswordStrengthResult[];

  beforeEach(() => {
    fetch = jasmine.createSpy('fetch').and.returnValue(rating(false, 0.4));
    sessionToken.set('session-token');
    authenticationService = jasmine.createSpyObj(
      'AuthenticationService',
      ['createGuestAccount', 'requireAuthentication'],
      { accessToken: sessionToken }
    );
    challengeService = jasmine.createSpyObj('ChallengeService', [
      'authenticateByChallenge',
    ]);
    challengeService.authenticateByChallenge.and.returnValues(
      of('check-token-1'),
      of('check-token-2'),
      of('check-token-3')
    );
    TestBed.configureTestingModule({
      providers: [
        { provide: UserPasswordStrengthGql, useValue: { fetch } },
        { provide: AuthenticationService, useValue: authenticationService },
        { provide: ChallengeService, useValue: challengeService },
      ],
    });
    service = TestBed.inject(PasswordStrengthService);
    passwords = new Subject();
    results = [];
  });

  function watch(mailAddress?: string) {
    return service
      .watch(
        passwords.pipe(
          map((password) => ({ password, ...(mailAddress && { mailAddress }) }))
        )
      )
      .subscribe((r) => results.push(r));
  }

  function fetchedMailAddresses(): (string | null)[] {
    return fetch.calls
      .allArgs()
      .map(([options]) => options.variables.query.mailAddress);
  }

  function fetchedTokens(): (string | null)[] {
    return fetch.calls
      .allArgs()
      .map(
        ([options]) => options.context.headers?.get('Authorization') ?? null
      );
  }

  function unauthorized() {
    return throwError(
      () =>
        new ServerError('Response not successful: Received status code 401', {
          response: new Response(null, { status: 401 }),
          bodyText: '',
        })
    );
  }

  function graphQlError(code: string) {
    return throwError(
      () =>
        new CombinedGraphQLErrors({
          errors: [
            {
              message: 'Bad request',
              extensions: { classification: 'BAD_REQUEST', code },
            },
          ],
        })
    );
  }

  function fetchedPasswords(): string[] {
    return fetch.calls
      .allArgs()
      .map(([options]) => options.variables.query.password);
  }

  it('should rate a password once typing pauses', fakeAsync(() => {
    const subscription = watch();
    passwords.next(PASSWORD);
    passwords.next(PASSWORD + '!');
    tick(299);
    expect(fetch).not.toHaveBeenCalled();
    tick(1);
    expect(fetchedPasswords()).toEqual([PASSWORD + '!']);
    expect(results).toEqual([
      {
        password: PASSWORD + '!',
        strength: { acceptable: false, relativeStrength: 0.4, hint: undefined },
      },
    ]);
    subscription.unsubscribe();
  }));

  it('should pass the mail address and keep the password out of the cache', fakeAsync(() => {
    const subscription = watch(MAIL_ADDRESS);
    passwords.next(PASSWORD);
    tick(300);
    expect(fetch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        variables: { query: { password: PASSWORD, mailAddress: MAIL_ADDRESS } },
        fetchPolicy: 'no-cache',
      })
    );
    subscription.unsubscribe();
  }));

  it('should rate a password again for another mail address', fakeAsync(() => {
    const requests = new Subject<PasswordStrengthRequest>();
    const subscription = service
      .watch(requests)
      .subscribe((r) => results.push(r));
    requests.next({ password: PASSWORD, mailAddress: MAIL_ADDRESS });
    tick(300);
    requests.next({ password: PASSWORD, mailAddress: MAIL_ADDRESS });
    tick(300);
    requests.next({ password: PASSWORD, mailAddress: OTHER_MAIL_ADDRESS });
    tick(300);
    expect(fetchedMailAddresses()).toEqual([MAIL_ADDRESS, OTHER_MAIL_ADDRESS]);
    expect(results.map((r) => r.mailAddress)).toEqual([
      MAIL_ADDRESS,
      OTHER_MAIL_ADDRESS,
    ]);
    subscription.unsubscribe();
  }));

  it('should treat an empty mail address as none', fakeAsync(() => {
    const requests = new Subject<PasswordStrengthRequest>();
    const subscription = service.watch(requests).subscribe();
    requests.next({ password: PASSWORD });
    tick(300);
    requests.next({ password: PASSWORD, mailAddress: '' });
    tick(300);
    expect(fetchedMailAddresses()).toEqual([null]);
    subscription.unsubscribe();
  }));

  it('should not rate a password below 8 characters', fakeAsync(() => {
    const subscription = watch();
    passwords.next('1234567');
    tick(1000);
    expect(fetch).not.toHaveBeenCalled();
    expect(results).toEqual([]);
    subscription.unsubscribe();
  }));

  it('should rate a password from 8 characters', fakeAsync(() => {
    const subscription = watch();
    passwords.next('12345678');
    tick(300);
    expect(fetchedPasswords()).toEqual(['12345678']);
    subscription.unsubscribe();
  }));

  it('should drop the rating of a password which has changed since', fakeAsync(() => {
    const stale = new Subject<unknown>();
    fetch.and.returnValues(stale, rating(true, 1));
    const subscription = watch();
    passwords.next(PASSWORD);
    tick(300);
    passwords.next(PASSWORD + '!');
    tick(300);
    stale.next({
      data: {
        userPasswordStrength: {
          acceptable: false,
          relativeStrength: 0.2,
          hint: null,
        },
      },
    });
    expect(results.map((r) => r.password)).toEqual([PASSWORD + '!']);
    subscription.unsubscribe();
  }));

  it('should retry with growing delays and report each failure', fakeAsync(() => {
    const failure = throwError(() => new Error('Network error'));
    fetch.and.returnValues(failure, failure, failure, rating(true, 1));
    const subscription = watch();
    passwords.next(PASSWORD);
    tick(300);
    expect(fetch).toHaveBeenCalledTimes(1);
    tick(999);
    expect(fetch).toHaveBeenCalledTimes(1);
    tick(1);
    expect(fetch).toHaveBeenCalledTimes(2);
    tick(2000);
    expect(fetch).toHaveBeenCalledTimes(3);
    tick(3999);
    expect(fetch).toHaveBeenCalledTimes(3);
    tick(1);
    expect(fetch).toHaveBeenCalledTimes(4);
    expect(results).toEqual([
      { password: PASSWORD },
      { password: PASSWORD },
      { password: PASSWORD },
      {
        password: PASSWORD,
        strength: { acceptable: true, relativeStrength: 1, hint: undefined },
      },
    ]);
    subscription.unsubscribe();
  }));

  it('should not retry a password refused as invalid', fakeAsync(() => {
    fetch.and.returnValue(graphQlError('INVALID_PASSWORD'));
    const subscription = watch(MAIL_ADDRESS);
    passwords.next(PASSWORD + ' ');
    tick(300 + 60000);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(results).toEqual([
      { password: PASSWORD + ' ', mailAddress: MAIL_ADDRESS, invalid: true },
    ]);
    subscription.unsubscribe();
  }));

  it('should retry after other GraphQL errors', fakeAsync(() => {
    fetch.and.returnValues(graphQlError('WEAK_PASSWORD'), rating(true, 1));
    const subscription = watch();
    passwords.next(PASSWORD);
    tick(300 + 1000);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(results).toEqual([
      { password: PASSWORD },
      {
        password: PASSWORD,
        strength: { acceptable: true, relativeStrength: 1, hint: undefined },
      },
    ]);
    subscription.unsubscribe();
  }));

  it('should cap the retry delay', fakeAsync(() => {
    fetch.and.returnValue(throwError(() => new Error('Network error')));
    const subscription = watch();
    passwords.next(PASSWORD);
    // 1 + 2 + 4 + 8 + 16 s, then 30 s instead of 32 s.
    tick(300 + 31000);
    expect(fetch).toHaveBeenCalledTimes(6);
    tick(29999);
    expect(fetch).toHaveBeenCalledTimes(6);
    tick(1);
    expect(fetch).toHaveBeenCalledTimes(7);
    subscription.unsubscribe();
  }));

  it('should start over with the shortest delay after a success', fakeAsync(() => {
    const failure = throwError(() => new Error('Network error'));
    fetch.and.returnValues(
      failure,
      rating(false, 0.4),
      failure,
      rating(true, 1)
    );
    const subscription = watch();
    passwords.next(PASSWORD);
    tick(300 + 1000);
    expect(fetch).toHaveBeenCalledTimes(2);
    passwords.next(PASSWORD + '!');
    tick(300);
    expect(fetch).toHaveBeenCalledTimes(3);
    tick(1000);
    expect(fetch).toHaveBeenCalledTimes(4);
    subscription.unsubscribe();
  }));

  it('should stop retrying once the password changes', fakeAsync(() => {
    fetch.and.returnValue(throwError(() => new Error('Network error')));
    const subscription = watch();
    passwords.next(PASSWORD);
    tick(300);
    passwords.next('short');
    tick(10000);
    expect(fetch).toHaveBeenCalledTimes(1);
    subscription.unsubscribe();
  }));

  it('should rate with the session of a signed-in user or guest', fakeAsync(() => {
    const subscription = watch();
    passwords.next(PASSWORD);
    tick(300);
    expect(fetchedTokens()).toEqual([null]);
    expect(challengeService.authenticateByChallenge).not.toHaveBeenCalled();
    subscription.unsubscribe();
  }));

  describe('without a session', () => {
    beforeEach(() => {
      sessionToken.set(undefined);
    });

    it('should not create a guest account', fakeAsync(() => {
      const subscription = watch();
      passwords.next(PASSWORD);
      tick(300);
      expect(
        authenticationService.requireAuthentication
      ).not.toHaveBeenCalled();
      expect(authenticationService.createGuestAccount).not.toHaveBeenCalled();
      subscription.unsubscribe();
    }));

    it('should fetch a check token only once one is needed', fakeAsync(() => {
      const subscription = watch();
      passwords.next('short');
      tick(300);
      expect(challengeService.authenticateByChallenge).not.toHaveBeenCalled();
      passwords.next(PASSWORD);
      tick(300);
      expect(challengeService.authenticateByChallenge).toHaveBeenCalledOnceWith(
        {
          reusable: true,
        }
      );
      expect(fetchedTokens()).toEqual(['Bearer check-token-1']);
      subscription.unsubscribe();
    }));

    it('should reuse the check token', fakeAsync(() => {
      const subscription = watch();
      passwords.next(PASSWORD);
      tick(300);
      passwords.next(PASSWORD + '!');
      tick(300);
      expect(challengeService.authenticateByChallenge).toHaveBeenCalledTimes(1);
      expect(fetchedTokens()).toEqual([
        'Bearer check-token-1',
        'Bearer check-token-1',
      ]);
      subscription.unsubscribe();
    }));

    it('should renew a rejected check token and retry at once', fakeAsync(() => {
      fetch.and.returnValues(unauthorized(), rating(true, 1));
      const subscription = watch();
      passwords.next(PASSWORD);
      tick(300);
      expect(fetchedTokens()).toEqual([
        'Bearer check-token-1',
        'Bearer check-token-2',
      ]);
      expect(results).toEqual([
        {
          password: PASSWORD,
          strength: { acceptable: true, relativeStrength: 1, hint: undefined },
        },
      ]);
      passwords.next(PASSWORD + '!');
      tick(300);
      expect(fetchedTokens()[2]).toBe('Bearer check-token-2');
      subscription.unsubscribe();
    }));

    it('should renew a rejected check token only once per attempt', fakeAsync(() => {
      fetch.and.returnValues(unauthorized(), unauthorized());
      const subscription = watch();
      passwords.next(PASSWORD);
      tick(300);
      expect(challengeService.authenticateByChallenge).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(results).toEqual([{ password: PASSWORD }]);
      subscription.unsubscribe();
    }));

    it('should retry with a new challenge if none could be solved', fakeAsync(() => {
      challengeService.authenticateByChallenge.and.returnValues(
        of(undefined),
        of('check-token-1')
      );
      const subscription = watch();
      passwords.next(PASSWORD);
      tick(300);
      expect(fetch).not.toHaveBeenCalled();
      expect(results).toEqual([{ password: PASSWORD }]);
      tick(1000);
      expect(fetchedTokens()).toEqual(['Bearer check-token-1']);
      subscription.unsubscribe();
    }));
  });
});
