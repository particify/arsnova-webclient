import { TestBed, inject } from '@angular/core/testing';

import { GlobalStorageService, STORAGE_CONFIG, STORAGECONFIG_PROVIDER_TOKEN } from './global-storage.service';
import { Injectable } from '@angular/core';
import { EventService } from '@arsnova/app/services/util/event.service';
import { MockEventService } from '@arsnova/testing/test-helpers';

@Injectable()
class MockLiveAnnouncer {}

describe('GlobalStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GlobalStorageService,
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: STORAGECONFIG_PROVIDER_TOKEN,
          useValue: STORAGE_CONFIG
        }
      ]
    });
  });

  it('should be created', inject([GlobalStorageService], (service: GlobalStorageService) => {
    expect(service).toBeTruthy();
  }));
});
