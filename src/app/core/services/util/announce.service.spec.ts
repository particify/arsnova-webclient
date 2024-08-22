import { TestBed, inject } from '@angular/core/testing';

import { AnnounceService } from './announce.service';
import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { MockTranslocoService } from '@testing/test-helpers';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Injectable()
class MockLiveAnnouncer {}

describe('AnnounceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AnnounceService,
        {
          provide: TranslocoService,
          useClass: MockTranslocoService,
        },
        {
          provide: LiveAnnouncer,
          useClass: MockLiveAnnouncer,
        },
      ],
    });
  });

  it('should be created', inject(
    [AnnounceService],
    (service: AnnounceService) => {
      expect(service).toBeTruthy();
    }
  ));
});
