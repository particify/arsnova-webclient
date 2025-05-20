import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '@testing/transloco-testing.module';

import { PrioritizationContentFormComponent } from './prioritization-content-form.component';
import { ContentService } from '@app/core/services/http/content.service';

describe('PrioritizationContentFormComponent', () => {
  let component: PrioritizationContentFormComponent;
  let fixture: ComponentFixture<PrioritizationContentFormComponent>;

  const mockContentService = jasmine.createSpyObj('ContentService', [
    'getAnswerOptions',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [getTranslocoModule(), PrioritizationContentFormComponent],
      providers: [
        {
          provide: ContentService,
          useValue: mockContentService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PrioritizationContentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
