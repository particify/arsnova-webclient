import { inject, TestBed } from '@angular/core/testing';

import { AbstractHttpService } from './abstract-http.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { EventService } from '../util/event.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

@Injectable()
class MockEventService {

}

@Injectable()
class MockNotificationService {

}

@Injectable()
class MockTranslateService {
  public get(key: string): Observable<String> {
    return of (key);
  }
}

@Injectable()
class TestHttpService extends AbstractHttpService<object> {
  constructor(http: HttpClient,
    protected eventService: EventService,
    protected translateService: TranslateService,
    protected notificationService: NotificationService) {
    super('/test', http, eventService, translateService, notificationService);
  }
}

describe('AbstractHttpService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestHttpService,
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService
        }
      ],
      imports: [
        HttpClientTestingModule
      ]
    });
  });

  it('should be created', inject([TestHttpService], (service: TestHttpService) => {
    expect(service).toBeTruthy();
  }));
});
