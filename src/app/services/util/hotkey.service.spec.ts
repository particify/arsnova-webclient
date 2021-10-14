import { TestBed, inject } from '@angular/core/testing';

import { HotkeyService } from '@arsnova/app/services/util/hotkey.service';
import { Injectable } from '@angular/core';
import { DialogService } from '@arsnova/app/services/util/dialog.service';

@Injectable()
class MockDialogService {
}

describe('HotkeyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HotkeyService,
        {
          provide: DialogService,
          useClass: MockDialogService
        }
      ]
    });
  });

  it('should be created', inject([HotkeyService], (service: HotkeyService) => {
    expect(service).toBeTruthy();
  }));
});
