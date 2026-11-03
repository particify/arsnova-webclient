import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ServerError } from '@apollo/client';
import { ChallengeService } from '@app/core/services/challenge.service';
import {
  AUTH_HEADER_KEY,
  AUTH_SCHEME,
  AuthenticationService,
} from '@app/core/services/http/authentication.service';
import { UserPasswordStrengthGql } from '@gql/generated/graphql';
import {
  ErrorCode,
  getOperationErrorCode,
} from '@gql/helper/handle-operation-error';
import {
  EMPTY,
  Observable,
  catchError,
  concat,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  switchMap,
  throwError,
  timer,
} from 'rxjs';

export interface PasswordStrength {
  acceptable: boolean;
  /** Share of the required strength, from 0 to 1, which only reaches 1 when acceptable. */
  relativeStrength: number;
  /** A single line on how to improve the password, in the UI language. */
  hint?: string;
}

/** A password to rate, with the mail address of the account, if known. */
export interface PasswordStrengthRequest {
  password: string;
  mailAddress?: string;
}

/**
 * The backend's verdict on a request, or none if it could not be reached. A password the backend
 * refuses to store at all is marked invalid instead.
 */
export interface PasswordStrengthResult extends PasswordStrengthRequest {
  strength?: PasswordStrength;
  invalid?: boolean;
}

/** Whether two requests are rated alike, an empty mail address counting as none. */
export function isSameRequest(
  a: PasswordStrengthRequest,
  b: PasswordStrengthRequest
): boolean {
  return (
    a.password === b.password && (a.mailAddress || '') === (b.mailAddress || '')
  );
}

export const MIN_PASSWORD_LENGTH = 10;
/** Rating starts a little short of the minimum, so the bar shows how close a password gets. */
export const MIN_RATED_PASSWORD_LENGTH = MIN_PASSWORD_LENGTH - 2;

const REJECTED_PASSWORD_MESSAGES: Partial<Record<ErrorCode, string>> = {
  [ErrorCode.InvalidPassword]: 'password.password-invalid',
  [ErrorCode.WeakPassword]: 'password.password-too-weak',
};

/** The translation key of the reason the backend refused to set a password, if it did. */
export function getRejectedPasswordMessageKey(
  error: unknown
): string | undefined {
  const code = getOperationErrorCode(error);
  return code && REJECTED_PASSWORD_MESSAGES[code];
}

const DEBOUNCE_MS = 300;
const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30000;

const HTTP_UNAUTHORIZED = 401;

/**
 * Has the backend rate new passwords, so it applies the same rules as when one is set.
 *
 * A visitor without a session gets no guest account for this. A token from a solved challenge
 * authorizes the ratings instead. It is only fetched once needed, and replaced when the backend no
 * longer accepts it.
 */
@Injectable({
  providedIn: 'root',
})
export class PasswordStrengthService {
  private readonly authenticationService = inject(AuthenticationService);
  private readonly challengeService = inject(ChallengeService);
  private readonly userPasswordStrengthGql = inject(UserPasswordStrengthGql);

  private checkToken?: Observable<string>;

  /**
   * Rates each request, once typing pauses and only from the rated length on. A request
   * changes with the password as well as with the mail address, which a password must not be
   * built from. Answers for a request which has since changed are dropped. A failed request is
   * reported without a strength and retried with growing delays until it succeeds or the request
   * changes, unless the backend refuses the password as invalid.
   */
  watch(
    requests: Observable<PasswordStrengthRequest>
  ): Observable<PasswordStrengthResult> {
    return requests.pipe(
      distinctUntilChanged(isSameRequest),
      debounceTime(DEBOUNCE_MS),
      switchMap((request) =>
        request.password.length < MIN_RATED_PASSWORD_LENGTH
          ? EMPTY
          : this.checkWithBackoff(request)
      )
    );
  }

  private checkWithBackoff(
    request: PasswordStrengthRequest,
    attempt = 0
  ): Observable<PasswordStrengthResult> {
    return this.check(request.password, request.mailAddress).pipe(
      map((strength) => ({ ...request, strength })),
      catchError((e) =>
        getOperationErrorCode(e) === ErrorCode.InvalidPassword
          ? of({ ...request, invalid: true })
          : concat(
              of({ ...request }),
              timer(this.getRetryDelay(attempt)).pipe(
                switchMap(() => this.checkWithBackoff(request, attempt + 1))
              )
            )
      )
    );
  }

  private getRetryDelay(attempt: number): number {
    return Math.min(INITIAL_RETRY_DELAY_MS * 2 ** attempt, MAX_RETRY_DELAY_MS);
  }

  private check(
    password: string,
    mailAddress: string | undefined
  ): Observable<PasswordStrength> {
    return this.authenticationService.accessToken()
      ? this.query(password, mailAddress)
      : this.checkWithToken(password, mailAddress, true);
  }

  private checkWithToken(
    password: string,
    mailAddress: string | undefined,
    renewOnRejection: boolean
  ): Observable<PasswordStrength> {
    return this.getCheckToken().pipe(
      switchMap((token) => this.query(password, mailAddress, token)),
      catchError((e) => {
        if (!renewOnRejection || !this.isUnauthorized(e)) {
          return throwError(() => e);
        }
        this.checkToken = undefined;
        return this.checkWithToken(password, mailAddress, false);
      })
    );
  }

  private getCheckToken(): Observable<string> {
    this.checkToken ??= this.challengeService
      .authenticateByChallenge({ reusable: true })
      .pipe(
        map((token) => {
          if (!token) {
            throw new Error('Challenge not solved.');
          }
          return token;
        }),
        catchError((e) => {
          this.checkToken = undefined;
          return throwError(() => e);
        }),
        shareReplay(1)
      );
    return this.checkToken;
  }

  private isUnauthorized(error: unknown): boolean {
    return ServerError.is(error) && error.statusCode === HTTP_UNAUTHORIZED;
  }

  /**
   * An explicit Authorization header keeps the authentication interceptor out of the request, so
   * a rejected check token never triggers the session's refresh or logout handling.
   */
  private query(
    password: string,
    mailAddress: string | undefined,
    checkToken?: string
  ): Observable<PasswordStrength> {
    return this.userPasswordStrengthGql
      .fetch({
        variables: { query: { password, mailAddress: mailAddress || null } },
        // Keeps passwords out of the cache.
        fetchPolicy: 'no-cache',
        context: {
          silentError: true,
          ...(checkToken && {
            headers: new HttpHeaders({
              [AUTH_HEADER_KEY]: `${AUTH_SCHEME} ${checkToken}`,
            }),
          }),
        },
      })
      .pipe(
        map((r) => {
          const strength = r.data?.userPasswordStrength;
          if (!strength) {
            throw new Error('No password strength returned.');
          }
          return {
            acceptable: strength.acceptable,
            relativeStrength: strength.relativeStrength,
            hint: strength.hint ?? undefined,
          };
        })
      );
  }
}
