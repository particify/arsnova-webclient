import { inject, TestBed } from '@angular/core/testing';

import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { Injectable } from '@angular/core';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { of } from 'rxjs';

@Injectable()
class MockAuthenticationService {
  getAuthenticationChanges() {
    return of(null);
  }
}

describe('WsConnectorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WsConnectorService,
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
      ],
    });
  });

  it('should be created', inject(
    [WsConnectorService],
    (service: WsConnectorService) => {
      expect(service).toBeTruthy();
    }
  ));
});
