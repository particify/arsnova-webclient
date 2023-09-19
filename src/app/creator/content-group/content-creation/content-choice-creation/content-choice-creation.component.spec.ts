import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentChoiceCreationComponent } from './content-choice-creation.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { MatButtonModule } from '@angular/material/button';
import { ContentService } from '@app/core/services/http/content.service';

describe('ContentChoiceCreationComponent', () => {
  let component: ContentChoiceCreationComponent;
  let fixture: ComponentFixture<ContentChoiceCreationComponent>;

  const mockContentService = jasmine.createSpyObj('ContentService', [
    'getAnswerOptions',
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentChoiceCreationComponent],
      imports: [getTranslocoModule(), MatButtonModule],
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
        fixture = TestBed.createComponent(ContentChoiceCreationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
