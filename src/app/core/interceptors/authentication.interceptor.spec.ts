import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { Injectable, signal } from '@angular/core';
import { AuthenticationInterceptor } from '@app/core/interceptors/authentication.interceptor';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { configureTestModule } from '@testing/test.setup';
import { Observable, of } from 'rxjs';

const REQUEST_URI = '/api/room/room-id';
const ACCESS_TOKEN = 'access-token';
const NEW_ACCESS_TOKEN = 'new-access-token';

@Injectable()
class MockAuthenticationService {
  private readonly token = signal<string | undefined>(ACCESS_TOKEN);
  readonly accessToken = this.token.asReadonly();

  handleUnauthorizedError(): Observable<undefined> {
    return of(undefined);
  }

  setAccessToken(token: string | undefined) {
    this.token.set(token);
  }
}

describe('AuthenticationInterceptor', () => {
  let httpTestingController: HttpTestingController;
  let authenticationService: MockAuthenticationService;
  let httpClient: HttpClient;

  beforeEach(() => {
    authenticationService = new MockAuthenticationService();
    const testBed = configureTestModule(
      [],
      [
        {
          provide: AuthenticationService,
          useValue: authenticationService,
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthenticationInterceptor,
          multi: true,
        },
      ]
    );
    httpTestingController = testBed.inject(HttpTestingController);
    httpClient = testBed.inject(HttpClient);
  });

  afterEach(() => {
    // Assert that there are no outstanding requests.
    httpTestingController.verify();
  });

  it('should add the access token to the request', () => {
    httpClient.get(REQUEST_URI).subscribe();
    const req = httpTestingController.expectOne(REQUEST_URI);

    expect(req.request.headers.get('Authorization')).toEqual(
      `Bearer ${ACCESS_TOKEN}`
    );
    req.flush({});
  });

  it('should retry with the new access token if it has been refreshed in the meantime', () => {
    const handleUnauthorizedError = spyOn(
      authenticationService,
      'handleUnauthorizedError'
    ).and.callThrough();
    httpClient.get(REQUEST_URI).subscribe();
    const req = httpTestingController.expectOne(REQUEST_URI);
    authenticationService.setAccessToken(NEW_ACCESS_TOKEN);
    req.flush('Error', { status: 401, statusText: 'Error 401' });

    expect(handleUnauthorizedError).not.toHaveBeenCalled();
    const retryReq = httpTestingController.expectOne(REQUEST_URI);

    expect(retryReq.request.headers.get('Authorization')).toEqual(
      `Bearer ${NEW_ACCESS_TOKEN}`
    );
    retryReq.flush({});
  });

  it('should retry with the new access token if the refresh succeeds', () => {
    spyOn(authenticationService, 'handleUnauthorizedError').and.callFake(() => {
      authenticationService.setAccessToken(NEW_ACCESS_TOKEN);
      return of(undefined);
    });
    httpClient.get(REQUEST_URI).subscribe();
    httpTestingController
      .expectOne(REQUEST_URI)
      .flush('Error', { status: 401, statusText: 'Error 401' });
    const retryReq = httpTestingController.expectOne(REQUEST_URI);

    expect(retryReq.request.headers.get('Authorization')).toEqual(
      `Bearer ${NEW_ACCESS_TOKEN}`
    );
    retryReq.flush({});
  });

  it('should not retry the request if the session has been reset', () => {
    spyOn(authenticationService, 'handleUnauthorizedError').and.callFake(() => {
      authenticationService.setAccessToken(undefined);
      return of(undefined);
    });
    let error: unknown;
    httpClient.get(REQUEST_URI).subscribe({ error: (e) => (error = e) });
    httpTestingController
      .expectOne(REQUEST_URI)
      .flush('Error', { status: 401, statusText: 'Error 401' });

    expect(error).toBeDefined();
    // No further request is expected. This is asserted by verify() in
    // afterEach().
  });
});
