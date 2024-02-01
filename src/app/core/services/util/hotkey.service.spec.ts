import { TestBed, inject } from '@angular/core/testing';

import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { Injectable } from '@angular/core';
import { DialogService } from '@app/core/services/util/dialog.service';
import { EventService } from '@app/core/services/util/event.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';

@Injectable()
class MockDialogService {}

@Injectable()
class MockEventService {}

@Injectable()
class MockGlobalStorageService {
  getItem(key: string) {
    return 0;
  }
}

describe('HotkeyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HotkeyService,
        {
          provide: DialogService,
          useClass: MockDialogService,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
      ],
    });
  });

  it('should be created', inject([HotkeyService], (service: HotkeyService) => {
    expect(service).toBeTruthy();
  }));
});
