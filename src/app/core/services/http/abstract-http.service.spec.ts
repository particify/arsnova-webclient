import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { AbstractHttpService } from './abstract-http.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@app/core/services/util/notification.service';
import { EventService } from '@app/core/services/util/event.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

@Injectable()
class MockEventService {}

@Injectable()
class MockNotificationService {}

@Injectable()
class MockTranslateService {
  public get(key: string): Observable<string> {
    return of(key);
  }
}

const TEST_URI1 = '/test/1';
const data1 = { id: 1 };

@Injectable()
class TestHttpService extends AbstractHttpService<object> {
  constructor(
    http: HttpClient,
    protected eventService: EventService,
    protected translateService: TranslateService,
    protected notificationService: NotificationService
  ) {
    super('/test', http, eventService, translateService, notificationService);
  }

  public override performGet<U extends object | object[]>(
    url: string,
    options?: {
      retryInitialInterval?: number;
    }
  ): Observable<U> {
    return super.performGet(url, options);
  }

  public override performPost<U extends object | object[]>(
    uri: string,
    body: U,
    options?: {
      retry?: boolean;
      retryInitialInterval?: number;
    }
  ): Observable<U> {
    return super.performPost(uri, body, options);
  }
}

describe('AbstractHttpService', () => {
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestHttpService,
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService,
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

  describe('performPost', () => {
    it('should perform a POST request and pass the response', inject(
      [TestHttpService],
      (service: TestHttpService) => {
        service
          .performPost(TEST_URI1, data1)
          .subscribe((data) => expect(data).toEqual(data1));
        const req = httpTestingController.expectOne({
          url: TEST_URI1,
          method: 'POST',
        });
        req.flush(data1);
      }
    ));
  });
});
