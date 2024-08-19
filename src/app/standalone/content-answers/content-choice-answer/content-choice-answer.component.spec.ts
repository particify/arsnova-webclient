import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentChoiceAnswerComponent } from './content-choice-answer.component';
import { ActivatedRouteStub } from '@testing/test-helpers';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { Room } from '@app/core/models/room';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { LanguageService } from '@app/core/services/util/language.service';

const snapshot = new ActivatedRouteSnapshot();

snapshot.data = {
  room: new Room('1234', 'shortId', 'abbreviation', 'name', 'description'),
};

const activatedRouteStub = new ActivatedRouteStub(
  undefined,
  undefined,
  snapshot
);

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
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
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
