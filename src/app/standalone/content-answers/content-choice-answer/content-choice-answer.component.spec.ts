import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentChoiceAnswerComponent } from './content-choice-answer.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { LanguageService } from '@app/core/services/util/language.service';

const mockLangService = jasmine.createSpyObj(LanguageService, [
  'ensureValidLang',
]);
mockLangService.ensureValidLang.and.returnValue(true);

describe('ContentChoiceAnswerComponent', () => {
  let component: ContentChoiceAnswerComponent;
  let fixture: ComponentFixture<ContentChoiceAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentChoiceAnswerComponent, getTranslocoModule()],
      providers: [
        {
          provide: LanguageService,
          useValue: mockLangService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentChoiceAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
