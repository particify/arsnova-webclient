import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentListSortComponent } from './content-list-sort.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ContentGroup } from '@app/core/models/content-group';

describe('ContentListSortComponent', () => {
  let component: ContentListSortComponent;
  let fixture: ComponentFixture<ContentListSortComponent>;

  const mockContentService = jasmine.createSpyObj('ContentService', [
    'getTypeIcons',
  ]);
  const mockContentPublishService = jasmine.createSpyObj(
    'ContentPublishService',
    ['isIndexPublished']
  );

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContentListSortComponent],
      imports: [getTranslocoModule()],
      providers: [
        {
          provide: ContentService,
          useValue: mockContentService,
        },
        {
          provide: ContentPublishService,
          useValue: mockContentPublishService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ContentListSortComponent);
    component = fixture.componentInstance;
    component.contents = [];
    component.contentGroup = new ContentGroup();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
