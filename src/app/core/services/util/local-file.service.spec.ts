import { TestBed, inject } from '@angular/core/testing';

import { LocalFileService } from '@core/services/util/local-file.service';

describe('LocalFileService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocalFileService],
    });
  });

  it('should be created', inject(
    [LocalFileService],
    (service: LocalFileService) => {
      expect(service).toBeTruthy();
    }
  ));
});
