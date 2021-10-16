import { TestBed, inject } from '@angular/core/testing';

import { LikertScaleService } from '@arsnova/app/services/util/likert-scale.service';

describe('LikertScaleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LikertScaleService]
    });
  });

  it('should be created', inject([LikertScaleService], (service: LikertScaleService) => {
    expect(service).toBeTruthy();
  }));
});
