import { inject } from '@angular/core/testing';
import { PresentationService } from './presentation.service';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { configureTestModule } from '@testing/test.setup';

describe('PresentationService', () => {
  const contentService = jasmine.createSpyObj(ContentService, ['getContent']);

  const contentGroupService = jasmine.createSpyObj(ContentGroupService, [
    'startContent',
  ]);
  beforeEach(() => {
    configureTestModule(
      [],
      [
        PresentationService,
        { provide: ContentService, useValue: contentService },
        { provide: ContentGroupService, useValue: contentGroupService },
      ]
    );
  });

  it('should be created', inject(
    [PresentationService],
    (service: PresentationService) => {
      expect(service).toBeTruthy();
    }
  ));
});
