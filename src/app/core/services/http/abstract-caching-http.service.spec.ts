import { inject, TestBed } from '@angular/core/testing';

import { AbstractCachingHttpService } from './abstract-caching-http.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { EventService } from '@app/core/services/util/event.service';
import { TranslocoService } from '@ngneat/transloco';
import { NotificationService } from '@app/core/services/util/notification.service';
import { CachingService } from '@app/core/services/util/caching.service';
import {
  MockEventService,
  MockNotificationService,
  MockTranslocoService,
} from '@testing/test-helpers';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import {
  HttpMethod,
  HttpOptions,
} from '@app/core/services/http/abstract-http.service';

@Injectable()
class MockWsConnectorService {}

@Injectable()
class MockCachingService {
  getCache() {}
}

@Injectable()
class TestCachingHttpService extends AbstractCachingHttpService<object> {
  constructor(
    httpClient: HttpClient,
    protected wsConnector: WsConnectorService,
    eventService: EventService,
    translateService: TranslocoService,
    notificationService: NotificationService,
    protected cachingService: CachingService
  ) {
    super(
      '/test',
      httpClient,
      wsConnector,
      eventService,
      translateService,
      notificationService,
      cachingService
    );
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestCachingHttpService,
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
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
      ],
      imports: [HttpClientTestingModule],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Assert that there are no outstanding requests.
    httpTestingController.verify();
  });

  it('should be created', inject(
    [TestCachingHttpService],
    (service: TestCachingHttpService) => {
      expect(service).toBeTruthy();
    }
  ));

  describe('fetchOne', () => {
    it('should perform a request and pass the response', inject(
      [TestCachingHttpService],
      (service: TestCachingHttpService) => {
        service
          .fetchOnce(TEST_URI1)
          .subscribe((data) => expect(data).toEqual(data1));
        const req = httpTestingController.expectOne(TEST_URI1);
        req.flush(data1);
      }
    ));

    it('should reuse in-flight requests from previous calls', inject(
      [TestCachingHttpService],
      (service: TestCachingHttpService) => {
        for (let i = 0; i < 3; i++) {
          service
            .fetchOnce(TEST_URI1)
            .subscribe((data) => expect(data).toEqual(data1));
        }
        const req = httpTestingController.expectOne(TEST_URI1);
        req.flush(data1);
      }
    ));

    it('should use a new request if the previous one is already resolved', inject(
      [TestCachingHttpService],
      (service: TestCachingHttpService) => {
        for (let i = 0; i < 3; i++) {
          service
            .fetchOnce(TEST_URI1)
            .subscribe((data) => expect(data).toEqual(data1));
          const req = httpTestingController.expectOne(TEST_URI1);
          req.flush(data1);
        }
      }
    ));

    it('should not reuse in-flight request if URIs do not match', inject(
      [TestCachingHttpService],
      (service: TestCachingHttpService) => {
        service
          .fetchOnce(TEST_URI1)
          .subscribe((data) => expect(data).toEqual(data1));
        const req1 = httpTestingController.expectOne(TEST_URI1);

        service
          .fetchOnce(TEST_URI2)
          .subscribe((data) => expect(data).toEqual(data2));
        const req2 = httpTestingController.expectOne(TEST_URI2);

        req1.flush(data1);
        req2.flush(data2);
      }
    ));

    it('should not reuse in-flight request if params do not match', inject(
      [TestCachingHttpService],
      (service: TestCachingHttpService) => {
        service
          .fetchOnce(TEST_URI1)
          .subscribe((data) => expect(data).toEqual(data1));
        const req1 = httpTestingController.expectOne(TEST_URI1);

        service
          .fetchOnce(TEST_URI1, params1)
          .subscribe((data) => expect(data).toEqual(data1));
        const req2 = httpTestingController.expectOne(
          TEST_URI1 + '?' + params1.toString()
        );

        service
          .fetchOnce(TEST_URI1, params2)
          .subscribe((data) => expect(data).toEqual(data1));
        const req3 = httpTestingController.expectOne(
          TEST_URI1 + '?' + params2.toString()
        );

        req1.flush(data1);
        req2.flush(data1);
        req3.flush(data1);
      }
    ));
  });

  describe('requestOnce', () => {
    it('should not reuse in-flight request if methods do not match', inject(
      [TestCachingHttpService],
      (service: TestCachingHttpService) => {
        service
          .requestOnce('POST', TEST_URI1, data1)
          .subscribe((data) => expect(data).toEqual(data1));
        const req1 = httpTestingController.expectOne(TEST_URI1);

        service
          .requestOnce('PUT', TEST_URI1, data1)
          .subscribe((data) => expect(data).toEqual(data1));
        const req2 = httpTestingController.expectOne(TEST_URI1);

        req1.flush(data1);
        req2.flush(data1);
      }
    ));
  });
});
