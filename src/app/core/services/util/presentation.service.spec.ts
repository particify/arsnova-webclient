import { TestBed, inject } from '@angular/core/testing';
import { PresentationService } from './presentation.service';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';

describe('PresentationService', () => {
  const contentService = jasmine.createSpyObj(ContentService, ['getContent']);

  const contentGroupService = jasmine.createSpyObj(ContentGroupService, [
    'startContent',
  ]);
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PresentationService,
        { provide: ContentService, useValue: contentService },
        { provide: ContentGroupService, useValue: contentGroupService },
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
