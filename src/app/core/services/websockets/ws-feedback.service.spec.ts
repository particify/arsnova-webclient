import { inject, TestBed } from '@angular/core/testing';

import { WsFeedbackService } from '@app/core/services/websockets/ws-feedback.service';
import { Injectable } from '@angular/core';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';

@Injectable()
class MockWsConnectorService {}

describe('WsFeedbackService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WsFeedbackService,
        {
          provide: WsConnectorService,
          useClass: MockWsConnectorService,
        },
      ],
    });
  });

  it('should be created', inject(
    [WsFeedbackService],
    (service: WsFeedbackService) => {
      expect(service).toBeTruthy();
    }
  ));
});
