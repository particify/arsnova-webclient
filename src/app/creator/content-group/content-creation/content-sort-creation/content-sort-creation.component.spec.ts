import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentSortCreationComponent } from './content-sort-creation.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentService } from '@app/core/services/http/content.service';

describe('ContentSortCreationComponent', () => {
  let component: ContentSortCreationComponent;
  let fixture: ComponentFixture<ContentSortCreationComponent>;

  const mockContentService = jasmine.createSpyObj('ContentService', [
    'getAnswerOptions',
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentSortCreationComponent],
      imports: [getTranslocoModule()],
      providers: [
        {
          provide: ContentService,
          useValue: mockContentService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ContentSortCreationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
