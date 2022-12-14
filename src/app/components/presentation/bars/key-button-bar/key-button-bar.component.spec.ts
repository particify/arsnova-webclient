import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { KeyButtonBarComponent } from './key-button-bar.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { JsonTranslationLoader } from '@arsnova/testing/test-helpers';
import { DOCUMENT } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('KeyButtonBarComponent', () => {
  let component: KeyButtonBarComponent;
  let fixture: ComponentFixture<KeyButtonBarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [KeyButtonBarComponent],
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
      providers: [
        {
          provide: Document,
          useExisting: DOCUMENT,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyButtonBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
