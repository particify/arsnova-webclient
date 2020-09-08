import { inject, TestBed } from '@angular/core/testing';

import { BaseHttpService } from './base-http.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable()
class MockNotificationService {

}

@Injectable()
class MockTranslateService {
  public get(key: string): Observable<String> {
    return of (key);
  }
}

describe('BaseHttpService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseHttpService,
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService
        }
      ]
    });
  });

  it('should be created', inject([BaseHttpService], (service: BaseHttpService) => {
    expect(service).toBeTruthy();
  }));
});
