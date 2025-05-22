import { fakeAsync, inject, tick } from '@angular/core/testing';
import { AbstractHttpService, HttpMethod } from './abstract-http.service';
import { TranslocoService } from '@jsverse/transloco';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpTestingController } from '@angular/common/http/testing';
import { configureTestModule } from '@testing/test.setup';

@Injectable()
class MockTranslocoService {
  public get(key: string): Observable<string> {
    return of(key);
  }
}

const TEST_URI1 = '/test/1';
const data1 = { id: 1 };

@Injectable()
class TestHttpService extends AbstractHttpService<object> {
  constructor() {
    super('/test');
  }

  public override performGet<U extends object | object[]>(
    url: string,
    options?: {
      retryInitialInterval?: number;
    }
  ): Observable<U> {
    return super.performGet(url, options);
  }

  public override performRequest<U extends object | object[] = object>(
    method: HttpMethod,
    uri: string,
    body?: object,
    options?: {
      retry?: boolean;
      retryInitialInterval?: number;
    }
  ): Observable<U> {
    return super.performRequest(method, uri, body, options);
  }
}

describe('AbstractHttpService', () => {
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    const testBed = configureTestModule(
      [],
      [
        TestHttpService,
        {
          provide: TranslocoService,
          useClass: MockTranslocoService,
        },
      ]
    );
    httpTestingController = testBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Assert that there are no outstanding requests.
    httpTestingController.verify();
  });

  it('should be created', inject(
    [TestHttpService],
    (service: TestHttpService) => {
      expect(service).toBeTruthy();
    }
  ));

  describe('performGet', () => {
    it('should perform a GET request and pass the response', inject(
      [TestHttpService],
      (service: TestHttpService) => {
        service
          .performGet(TEST_URI1)
          .subscribe((data) => expect(data).toEqual(data1));
        const req = httpTestingController.expectOne({
          url: TEST_URI1,
          method: 'GET',
        });
        req.flush(data1);
      }
    ));

    it('should retry GET requests failed with error code 5xx', fakeAsync(
      inject([TestHttpService], (service: TestHttpService) => {
        const retryInitialInterval = 1000;
        service
          .performGet(TEST_URI1, { retryInitialInterval: retryInitialInterval })
          .subscribe((data) => expect(data).toEqual(data1));

        const req1 = httpTestingController.expectOne(TEST_URI1);
        req1.flush('Error', {
          status: 500,
          statusText: 'Error 500',
        });

        tick(retryInitialInterval);
        const req2 = httpTestingController.expectOne(TEST_URI1);
        req2.flush('Error', {
          status: 599,
          statusText: 'Error 599',
        });

        tick(retryInitialInterval * 2);
        const req3 = httpTestingController.expectOne(TEST_URI1);
        req3.flush(data1);
      })
    ));

    it('should not retry GET requests failed with error code 400', inject(
      [TestHttpService],
      (service: TestHttpService) => {
        const retryInitialInterval = 1000;
        const error = {
          status: 400,
          statusText: 'Error 400',
        };
        service
          .performGet(TEST_URI1, { retryInitialInterval: retryInitialInterval })
          .subscribe({
            error: (err) => {
              expect(err).toBeTruthy();
              expect(err.status).toEqual(error.status);
            },
          });
        const req1 = httpTestingController.expectOne(TEST_URI1);
        req1.flush('Error', error);
      }
    ));
  });

  describe('performRequest(POST, ...)', () => {
    it('should perform a POST request and pass the response', inject(
      [TestHttpService],
      (service: TestHttpService) => {
        const method = 'POST';
        service
          .performRequest(method, TEST_URI1, data1)
          .subscribe((data) => expect(data).toEqual(data1));
        const req = httpTestingController.expectOne({
          url: TEST_URI1,
          method: method,
        });
        req.flush(data1);
      }
    ));
  });
});
