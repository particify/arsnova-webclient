import { TestBed, inject } from '@angular/core/testing';

import {
  GlobalStorageService,
  STORAGE_CONFIG,
  STORAGECONFIG_PROVIDER_TOKEN,
} from './global-storage.service';
import { EventService } from '@app/core/services/util/event.service';
import { MockEventService } from '@testing/test-helpers';

describe('GlobalStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GlobalStorageService,
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: STORAGECONFIG_PROVIDER_TOKEN,
          useValue: STORAGE_CONFIG,
        },
      ],
    });
  });

  it('should be created', inject(
    [GlobalStorageService],
    (service: GlobalStorageService) => {
      expect(service).toBeTruthy();
    }
  ));
});
