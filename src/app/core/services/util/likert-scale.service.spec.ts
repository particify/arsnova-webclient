import { TestBed, inject } from '@angular/core/testing';

import { LikertScaleService } from '@app/core/services/util/likert-scale.service';

describe('LikertScaleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LikertScaleService],
    });
  });

  it('should be created', inject(
    [LikertScaleService],
    (service: LikertScaleService) => {
      expect(service).toBeTruthy();
    }
  ));
});
