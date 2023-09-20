import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChoiceContentFormComponent } from './choice-content-form.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { MatButtonModule } from '@angular/material/button';
import { ContentService } from '@app/core/services/http/content.service';

describe('ChoiceContentFormComponent', () => {
  let component: ChoiceContentFormComponent;
  let fixture: ComponentFixture<ChoiceContentFormComponent>;

  const mockContentService = jasmine.createSpyObj('ContentService', [
    'getAnswerOptions',
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ChoiceContentFormComponent],
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
        fixture = TestBed.createComponent(ChoiceContentFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
