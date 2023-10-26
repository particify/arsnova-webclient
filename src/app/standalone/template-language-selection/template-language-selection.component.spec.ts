import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateLanguageSelectionComponent } from './template-language-selection.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('TemplateLanguageSelectionComponent', () => {
  let component: TemplateLanguageSelectionComponent;
  let fixture: ComponentFixture<TemplateLanguageSelectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TemplateLanguageSelectionComponent,
        getTranslocoModule(),
        BrowserAnimationsModule,
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
