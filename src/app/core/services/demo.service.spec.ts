import { inject, TestBed } from '@angular/core/testing';

import { DemoService } from '@app/core/services/demo.service';
import { Injectable } from '@angular/core';
import { EventService } from '@app/core/services/util/event.service';
import { MockEventService, MockTranslateService } from '@testing/test-helpers';
import { RoomService } from '@app/core/services/http/room.service';
import { TranslateService } from '@ngx-translate/core';
import { ApiConfigService } from '@app/core/services/http/api-config.service';

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
