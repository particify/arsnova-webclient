import { TestBed, inject } from '@angular/core/testing';

import { AuthenticationInterceptor } from './authentication.interceptor';
import { AuthenticationService } from '@core/services/http/authentication.service';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable()
class MockAuthenticationService {
  getAuthenticationChanges() {
    return of(null);
  }
}

describe('AuthenticationInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthenticationInterceptor,
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
      ],
    });
  });

  it('should be created', inject(
    [AuthenticationInterceptor],
    (interceptor: AuthenticationInterceptor) => {
      expect(interceptor).toBeTruthy();
    }
  ));
});
