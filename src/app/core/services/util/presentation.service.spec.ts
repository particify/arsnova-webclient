import { TestBed, inject } from '@angular/core/testing';
import { PresentationService } from './presentation.service';

describe('PresentationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PresentationService],
    });
  });

  it('should be created', inject(
    [PresentationService],
    (service: PresentationService) => {
      expect(service).toBeTruthy();
    }
  ));
});
