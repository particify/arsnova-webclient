import { inject, TestBed } from '@angular/core/testing';

import { DemoService } from 'app/services/demo.service';
import { Injectable } from '@angular/core';
import { EventService } from '@arsnova/app/services/util/event.service';
import {
  MockEventService,
  MockTranslateService,
} from '@arsnova/testing/test-helpers';
import { RoomService } from '@arsnova/app/services/http/room.service';
import { TranslateService } from '@ngx-translate/core';
import { ApiConfigService } from '@arsnova/app/services/http/api-config.service';

@Injectable()
class MockApiConfigService {}

@Injectable()
class MockRoomService {}

describe('DemoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DemoService,
        {
          provide: TranslateService,
          useClass: MockTranslateService,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: ApiConfigService,
          useClass: MockApiConfigService,
        },
        {
          provide: RoomService,
          useClass: MockRoomService,
        },
      ],
    });
  });

  it('should be created', inject([DemoService], (service: DemoService) => {
    expect(service).toBeTruthy();
  }));
});
