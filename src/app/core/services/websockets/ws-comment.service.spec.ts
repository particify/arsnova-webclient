import { inject, TestBed } from '@angular/core/testing';

import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { Injectable } from '@angular/core';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';

@Injectable()
class MockWsConnectorService {}

describe('WsCommentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WsCommentService,
        {
          provide: WsConnectorService,
          useClass: MockWsConnectorService,
        },
      ],
    });
  });

  it('should be created', inject(
    [WsCommentService],
    (service: WsCommentService) => {
      expect(service).toBeTruthy();
    }
  ));
});
