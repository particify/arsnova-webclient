import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ScaleContentFormComponent } from './scale-content-form.component';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { LanguageService } from '@app/core/services/util/language.service';

@Injectable()
class MockLikertScaleService {
  getOptionLabels() {}
}

describe('ScaleContentFormComponent', () => {
  let component: ScaleContentFormComponent;
  let fixture: ComponentFixture<ScaleContentFormComponent>;

  const mockLangService = jasmine.createSpyObj(LanguageService, [
    'ensureValidLang',
  ]);
  mockLangService.ensureValidLang.and.returnValue(true);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ScaleContentFormComponent],
      providers: [
        {
          provide: LikertScaleService,
          useClass: MockLikertScaleService,
        },
        {
          provide: LanguageService,
          useValue: mockLangService,
        },
      ],
      imports: [getTranslocoModule()],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ScaleContentFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
