import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateLanguageSelectionComponent } from './template-language-selection.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LanguageService } from '@app/core/services/util/language.service';
import { of } from 'rxjs';

describe('TemplateLanguageSelectionComponent', () => {
  let component: TemplateLanguageSelectionComponent;
  let fixture: ComponentFixture<TemplateLanguageSelectionComponent>;

  const mockLangService = jasmine.createSpyObj(LanguageService, [
    'getIsoLanguages',
  ]);
  mockLangService.getIsoLanguages.and.returnValue(of([]));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TemplateLanguageSelectionComponent,
        getTranslocoModule(),
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: LanguageService,
          useValue: mockLangService,
        },
      ],
    });
    fixture = TestBed.createComponent(TemplateLanguageSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
