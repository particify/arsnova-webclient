import { AbstractCachingHttpService } from './abstract-caching-http.service';
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { TranslocoService } from '@jsverse/transloco';
import { CachingService } from '@app/core/services/util/caching.service';
import { MockTranslocoService } from '@testing/test-helpers';
import { HttpTestingController } from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import {
  HttpMethod,
  HttpOptions,
} from '@app/core/services/http/abstract-http.service';
import { configureTestModule } from '@testing/test.setup';

@Injectable()
class MockWsConnectorService {}

@Injectable()
class MockCachingService {
  getCache() {}
}

@Injectable()
class TestCachingHttpService extends AbstractCachingHttpService<object> {
  constructor() {
    super('/test');
  }

  public override fetchOnce<U extends object | object[]>(
    uri: string,
    params?: HttpParams
  ): Observable<U> {
    return super.fetchOnce(uri, params);
  }

  public override requestOnce<U extends object | object[]>(
    method: HttpMethod,
    uri: string,
    body: object,
    options?: Omit<HttpOptions, 'body'>
  ): Observable<U> {
    return super.requestOnce(method, uri, body, options);
  }

  public override fetchWithCache(uri: string): Observable<object> {
    return super.fetchWithCache(uri);
  }
}

const TEST_URI1 = '/test/1';
const TEST_URI2 = '/test/2';
const data1 = { id: 1 };
const data2 = { id: 2 };
const params1 = new HttpParams({ fromObject: { testParam: true } });
const params2 = new HttpParams({ fromObject: { testParam: false } });

describe('AbstractCachingHttpService', () => {
  let httpTestingController: HttpTestingController;
  let testCachingHttpService: TestCachingHttpService;

  beforeEach(() => {
    const testBed = configureTestModule(
      [],
      [
        TestCachingHttpService,
        {
          provide: TranslocoService,
          useClass: MockTranslocoService,
        },
        {
          provide: WsConnectorService,
          useClass: MockWsConnectorService,
        },
        {
          provide: CachingService,
          useClass: MockCachingService,
        },
      ]
    );
    httpTestingController = testBed.inject(HttpTestingController);
    testCachingHttpService = testBed.inject(TestCachingHttpService);
  });

  afterEach(() => {
    // Assert that there are no outstanding requests.
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(testCachingHttpService).toBeTruthy();
  });

  describe('fetchOne', () => {
    it('should perform a request and pass the response', () => {
      testCachingHttpService
        .fetchOnce(TEST_URI1)
        .subscribe((data) => expect(data).toEqual(data1));
      const req = httpTestingController.expectOne(TEST_URI1);
      req.flush(data1);
    });
  });

  it('should reuse in-flight requests from previous calls', () => {
    for (let i = 0; i < 3; i++) {
      testCachingHttpService
        .fetchOnce(TEST_URI1)
        .subscribe((data) => expect(data).toEqual(data1));
    }
    const req = httpTestingController.expectOne(TEST_URI1);
    req.flush(data1);
  });

  it('should use a new request if the previous one is already resolved', () => {
    for (let i = 0; i < 3; i++) {
      testCachingHttpService
        .fetchOnce(TEST_URI1)
        .subscribe((data) => expect(data).toEqual(data1));
      const req = httpTestingController.expectOne(TEST_URI1);
      req.flush(data1);
    }
  });

  it('should not reuse in-flight request if URIs do not match', () => {
    testCachingHttpService
      .fetchOnce(TEST_URI1)
      .subscribe((data) => expect(data).toEqual(data1));
    const req1 = httpTestingController.expectOne(TEST_URI1);

    testCachingHttpService
      .fetchOnce(TEST_URI2)
      .subscribe((data) => expect(data).toEqual(data2));
    const req2 = httpTestingController.expectOne(TEST_URI2);

    req1.flush(data1);
    req2.flush(data2);
  });

  it('should not reuse in-flight request if params do not match', () => {
    testCachingHttpService
      .fetchOnce(TEST_URI1)
      .subscribe((data) => expect(data).toEqual(data1));
    const req1 = httpTestingController.expectOne(TEST_URI1);

    testCachingHttpService
      .fetchOnce(TEST_URI1, params1)
      .subscribe((data) => expect(data).toEqual(data1));
    const req2 = httpTestingController.expectOne(
      TEST_URI1 + '?' + params1.toString()
    );

    testCachingHttpService
      .fetchOnce(TEST_URI1, params2)
      .subscribe((data) => expect(data).toEqual(data1));
    const req3 = httpTestingController.expectOne(
      TEST_URI1 + '?' + params2.toString()
    );

    req1.flush(data1);
    req2.flush(data1);
    req3.flush(data1);
  });

  describe('requestOnce', () => {
    it('should not reuse in-flight request if methods do not match', () => {
      testCachingHttpService
        .requestOnce('POST', TEST_URI1, data1)
        .subscribe((data) => expect(data).toEqual(data1));
      const req1 = httpTestingController.expectOne(TEST_URI1);

      testCachingHttpService
        .requestOnce('PUT', TEST_URI1, data1)
        .subscribe((data) => expect(data).toEqual(data1));
      const req2 = httpTestingController.expectOne(TEST_URI1);

      req1.flush(data1);
      req2.flush(data1);
    });
  });
});
