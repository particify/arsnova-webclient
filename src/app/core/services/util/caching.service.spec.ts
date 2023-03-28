import { TestBed, inject } from '@angular/core/testing';

import { CachingService } from './caching.service';
import { Injectable } from '@angular/core';
import { WsConnectorService } from '@core/services/websockets/ws-connector.service';
import { of } from 'rxjs';

@Injectable()
class MockWsConnectorService {
  getConnectionState() {
    return of(null);
  }
}

describe('CachingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CachingService,
        {
          provide: WsConnectorService,
          useClass: MockWsConnectorService,
        },
      ],
    });
  });

  it('should be created', inject(
    [CachingService],
    (service: CachingService) => {
      expect(service).toBeTruthy();
    }
  ));
});
