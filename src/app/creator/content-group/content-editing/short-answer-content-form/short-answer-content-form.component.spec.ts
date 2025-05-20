import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShortAnswerContentFormComponent } from './short-answer-content-form.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { MatButtonModule } from '@angular/material/button';
import { ContentService } from '@app/core/services/http/content.service';

describe('ShortAnswerContentFormComponent', () => {
  let component: ShortAnswerContentFormComponent;
  let fixture: ComponentFixture<ShortAnswerContentFormComponent>;

  const mockContentService = jasmine.createSpyObj('ContentService', [
    'getAnswerOptions',
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        getTranslocoModule(),
        MatButtonModule,
        ShortAnswerContentFormComponent,
      ],
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
        fixture = TestBed.createComponent(ShortAnswerContentFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
