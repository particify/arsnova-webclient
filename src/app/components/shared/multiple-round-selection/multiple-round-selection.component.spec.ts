import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonTranslationLoader } from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { MultipleRoundSelectionComponent } from './multiple-round-selection.component';

describe('MultipleRoundSelectionComponent', () => {
  let component: MultipleRoundSelectionComponent;
  let fixture: ComponentFixture<MultipleRoundSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MultipleRoundSelectionComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MultipleRoundSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
