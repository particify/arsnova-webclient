import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '@testing/transloco-testing.module';

import { ContentPrioritizationCreationComponent } from './content-prioritization-creation.component';
import { ContentService } from '@app/core/services/http/content.service';

describe('ContentPrioritizationCreationComponent', () => {
  let component: ContentPrioritizationCreationComponent;
  let fixture: ComponentFixture<ContentPrioritizationCreationComponent>;

  const mockContentService = jasmine.createSpyObj('ContentService', [
    'getAnswerOptions',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContentPrioritizationCreationComponent],
      imports: [getTranslocoModule()],
      providers: [
        {
          provide: ContentService,
          useValue: mockContentService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentPrioritizationCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
