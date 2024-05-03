import { TestBed, inject } from '@angular/core/testing';
import { PresentationService } from './presentation.service';
import { ContentService } from '@app/core/services/http/content.service';

describe('PresentationService', () => {
  const contentService = jasmine.createSpyObj(ContentService, [
    'startCountdown',
    'getContent',
  ]);
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PresentationService,
        { provide: ContentService, useValue: contentService },
      ],
    });
  });

  it('should be created', inject(
    [PresentationService],
    (service: PresentationService) => {
      expect(service).toBeTruthy();
    }
  ));
});
